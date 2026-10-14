from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from question_manager.models import QuestionData, QuestionVersion


class QuestionManagerAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="editor")
        self.user.set_password("StrongPass!123")
        self.user.save()
        self.other_user = User.objects.create_user(username="other")
        self.other_user.set_password("StrongPass!123")
        self.other_user.save()
        self.superuser = User.objects.create_user(username="admin2", email="admin2@example.com")
        self.superuser.is_staff = True
        self.superuser.is_superuser = True
        self.superuser.set_password("StrongPass!123")
        self.superuser.save()
        self.user_token = Token.objects.create(user=self.user).key
        self.other_token = Token.objects.create(user=self.other_user).key
        self.super_token = Token.objects.create(user=self.superuser).key

        self.question = QuestionData.objects.create(
            title="Vraag",
            explanation="Uitleg",
            source="CAO",
            category="Algemeen",
            tags="cao, regels",
            created_by=self.user,
        )

    def auth_headers(self, token):
        return {"HTTP_AUTHORIZATION": f"Token {token}"}

    def question_payload(self, title="Nieuwe vraag"):
        return {
            "title": title,
            "explanation": "Voorbeeld uitleg",
            "source": "CAO",
            "category": "Algemeen",
            "tags": "tag1,tag2",
        }

    def test_public_question_retrieval(self):
        response = self.client.get("/api/question-data/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_public_login(self):
        response = self.client.post(
            "/api-token-auth/",
            {"username": "editor", "password": "StrongPass!123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)

    def test_anonymous_mutations_rejected(self):
        create_response = self.client.post("/api/question-data/", self.question_payload(), format="json")
        self.assertEqual(create_response.status_code, 401)

        edit_response = self.client.put(
            f"/api/question-data/{self.question.id}/",
            self.question_payload(title="Wijziging"),
            format="json",
        )
        self.assertEqual(edit_response.status_code, 401)

        delete_response = self.client.delete(f"/api/question-data/delete/{self.question.id}/")
        self.assertEqual(delete_response.status_code, 401)

        password_response = self.client.post("/api/change-password/", {"newPassword": "StrongPass!999"}, format="json")
        self.assertEqual(password_response.status_code, 401)

    def test_authenticated_create_and_edit(self):
        create_response = self.client.post(
            "/api/question-data/",
            self.question_payload(),
            format="json",
            **self.auth_headers(self.user_token),
        )
        self.assertEqual(create_response.status_code, 201)

        edit_response = self.client.put(
            f"/api/question-data/{self.question.id}/",
            self.question_payload(title="Aangepast"),
            format="json",
            **self.auth_headers(self.other_token),
        )
        self.assertEqual(edit_response.status_code, 200)
        self.question.refresh_from_db()
        self.assertEqual(self.question.title, "Aangepast")
        self.assertEqual(self.question.last_edited_by, self.other_user)

    def test_delete_permissions(self):
        other_delete = self.client.delete(
            f"/api/question-data/delete/{self.question.id}/",
            **self.auth_headers(self.other_token),
        )
        self.assertEqual(other_delete.status_code, 401)

        admin_delete = self.client.delete(
            f"/api/question-data/delete/{self.question.id}/",
            **self.auth_headers(self.super_token),
        )
        self.assertEqual(admin_delete.status_code, 200)
        self.assertFalse(QuestionData.objects.filter(id=self.question.id).exists())

    def test_password_change_validation_and_success(self):
        weak_response = self.client.post(
            "/api/change-password/",
            {"newPassword": "123456"},
            format="json",
            **self.auth_headers(self.user_token),
        )
        self.assertEqual(weak_response.status_code, 400)

        strong_password = "NewStrongPass!2026"
        strong_response = self.client.post(
            "/api/change-password/",
            {"newPassword": strong_password},
            format="json",
            **self.auth_headers(self.user_token),
        )
        self.assertEqual(strong_response.status_code, 200)

        login_response = self.client.post(
            "/api-token-auth/",
            {"username": "editor", "password": strong_password},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertIn("token", login_response.data)

    def test_question_version_updates_on_mutations(self):
        version_before = QuestionVersion.objects.first().version

        create_response = self.client.post(
            "/api/question-data/",
            self.question_payload(title="Version create"),
            format="json",
            **self.auth_headers(self.user_token),
        )
        self.assertEqual(create_response.status_code, 201)

        update_response = self.client.put(
            f"/api/question-data/{self.question.id}/",
            self.question_payload(title="Version update"),
            format="json",
            **self.auth_headers(self.user_token),
        )
        self.assertEqual(update_response.status_code, 200)

        delete_response = self.client.delete(
            f"/api/question-data/delete/{self.question.id}/",
            **self.auth_headers(self.user_token),
        )
        self.assertEqual(delete_response.status_code, 200)

        version_after = QuestionVersion.objects.first().version
        self.assertGreaterEqual(version_after, version_before + 3)


class QuestionVersionEndpointTests(APITestCase):
    def test_missing_version_returns_404(self):
        response = self.client.get("/api/question-version/")
        self.assertEqual(response.status_code, 404)
