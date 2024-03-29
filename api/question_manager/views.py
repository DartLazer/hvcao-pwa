from django.contrib.auth import authenticate
from django.http import Http404
from rest_framework import status, generics
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import QuestionData, QuestionVersion
from .serializers import QuestionDataSerializer, QuestionDataGetSerializer


@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if username is None or password is None:
        return Response({'error': 'Please provide both username and password'},
                        status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid Credentials'},
                        status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key},
                    status=status.HTTP_200_OK)


class TestView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        """
        Return a simple message if the provided token is valid.
        """
        return Response({"message": "Hello, World!"})


class GetQuestionVersion(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        """
        Returns the version of the questions.
        """
        try:
            question_version = QuestionVersion.objects.first()
            return Response({"version": question_version.version})
        except QuestionVersion.DoesNotExist:
            raise Http404


class QuestionDataCreateAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes_by_method = {
        'POST': [IsAuthenticated],
        'GET': [AllowAny],
        'DELETE': [IsAuthenticated],
    }

    def get_permissions(self):
        permissions = self.permission_classes_by_method.get(self.request.method)
        if permissions is None:
            permissions = self.permission_classes
        return [permission() for permission in permissions]

    def put(self, request, pk, format=None):
        question = self.get_object(pk)
        serializer = QuestionDataSerializer(question, data=request.data)
        if serializer.is_valid():
            # set last_edited_by field to the user making the request
            serializer.save(last_edited_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, format=None):
        serializer = QuestionDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def get(self, request):
        question_data = QuestionData.objects.all()
        serializer = QuestionDataGetSerializer(question_data, many=True)
        return Response(serializer.data)

    def get_object(self, pk):
        try:
            return QuestionData.objects.get(pk=pk)
        except QuestionData.DoesNotExist:
            raise Http404


class QuestionDataDeleteAPIView(generics.DestroyAPIView):
    queryset = QuestionData.objects.all()
    serializer_class = QuestionDataSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        obj_to_delete = self.queryset.get(id=kwargs['pk'])
        print(obj_to_delete)
        if request.user == obj_to_delete.created_by or request.user.is_superuser:
            obj_to_delete.delete()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED, )


class ChangePasswordView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_password = request.data.get('newPassword')

        if new_password is None:
            return Response({'error': 'Wachtwoord veld is leeg'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'error': 'Wachtwoord moet minimaal 6 tekens lang zijn'},
                            status=status.HTTP_411_LENGTH_REQUIRED)

        user.set_password(new_password)
        user.save()
        print(f'User: {user} changed password successfully')
        return Response({'status': 'Wachtwoord veranderd!'}, status=status.HTTP_200_OK)
