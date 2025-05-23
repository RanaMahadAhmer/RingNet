package com.ranamahadahmer.ringnet.view_models

import android.content.Context
import android.util.Patterns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope

import com.ranamahadahmer.ringnet.api.BackendApi
import com.ranamahadahmer.ringnet.api.auth.SignInService
import com.ranamahadahmer.ringnet.api.auth.SignUpService
import com.ranamahadahmer.ringnet.database.DataStoreManager
import com.ranamahadahmer.ringnet.models.auth.AuthResponse
import com.ranamahadahmer.ringnet.models.auth.SignInRequestBody
import com.ranamahadahmer.ringnet.models.auth.SignUpRequestBody
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext


class AuthViewModel(context: Context) : ViewModel() {

    private val _signInApiService: SignInService =
        BackendApi.retrofit.create(SignInService::class.java)
    private val _signUpApiService: SignUpService =
        BackendApi.retrofit.create(SignUpService::class.java)

    private val _signInResponse: MutableStateFlow<AuthResponse> =
        MutableStateFlow(AuthResponse.Initial)
    val signInResponse: StateFlow<AuthResponse> get() = _signInResponse

    private val _signUpResponse: MutableStateFlow<AuthResponse> =
        MutableStateFlow(AuthResponse.Initial)
    val signUpResponse: StateFlow<AuthResponse> get() = _signUpResponse

    private val dataStoreManager = DataStoreManager(context = context)


    private val _email: MutableStateFlow<String> = MutableStateFlow("")
    val email: StateFlow<String> get() = _email
    private val _name: MutableStateFlow<String> = MutableStateFlow("")
    val name: StateFlow<String> get() = _name

    private val _passwordOne: MutableStateFlow<String> = MutableStateFlow("")
    val passwordOne: StateFlow<String> get() = _passwordOne
    private val _passwordTwo: MutableStateFlow<String> = MutableStateFlow("")
    val passwordTwo: StateFlow<String> get() = _passwordTwo

    private val _token: MutableStateFlow<String> = MutableStateFlow("")
    val token: StateFlow<String> get() = _token
    private val _userId: MutableStateFlow<String> = MutableStateFlow("")
    val userId: StateFlow<String> get() = _userId

    private val _isUserLoggedIn: MutableStateFlow<Boolean> = MutableStateFlow(false)
    val isUserLoggedIn: StateFlow<Boolean> get() = _isUserLoggedIn


    fun changeName(value: String) {
        _name.value = value.trim()
    }


    fun changeEmail(value: String) {
        _email.value = value.trim()

    }

    fun changePasswordOne(value: String) {
        _passwordOne.value = value.trim()
    }

    fun changePasswordTwo(value: String) {
        _passwordTwo.value = value.trim()
    }

    fun passwordsMatch(): Boolean {
        return _passwordOne.value == _passwordTwo.value
    }


    fun emailValid(): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(_email.value).matches()
    }

    fun emailEmpty(): Boolean {
        return _email.value.isEmpty()
    }

    fun passwordValid(): Boolean {
        return _passwordOne.value.length >= 6
    }

    fun signUpValid(): Boolean {
        return _name.value.isNotEmpty() && _email.value.isNotEmpty() && _passwordOne.value.isNotEmpty() && _passwordTwo.value.isNotEmpty()
    }


    init {

        viewModelScope.launch(Dispatchers.IO) {
            val savedToken = dataStoreManager.token.first()
            val savedUserId = dataStoreManager.userId.first()

            withContext(Dispatchers.Main) {
                _token.value = savedToken.orEmpty()
                _userId.value = savedUserId.orEmpty()

                _isUserLoggedIn.value = !savedToken.isNullOrEmpty() && !savedUserId.isNullOrEmpty()
            }
        }

    }


    fun saveUser() {
        viewModelScope.launch {
            if (_signInResponse.value is AuthResponse.Success) {
                _token.value = (_signInResponse.value as AuthResponse.Success).token
                _userId.value = (_signInResponse.value as AuthResponse.Success).userId
                _isUserLoggedIn.value = true
                dataStoreManager.insertData(
                    mapOf(
                        "token" to (_signInResponse.value as AuthResponse.Success).token,
                        "userId" to (_signInResponse.value as AuthResponse.Success).userId
                    )
                )
            }
        }
    }


    fun signIn() {


        viewModelScope.launch {
            _signInResponse.value = AuthResponse.Loading
            try {
                val request = SignInRequestBody(_email.value, _passwordOne.value)
                val result = withContext(Dispatchers.IO) { _signInApiService.signIn(request) }
                _signInResponse.value =
                    AuthResponse.Success(result.message, result.token, result.userId)


            } catch (e: Exception) {
                _signInResponse.value = AuthResponse.Error(e.message ?: "An error occurred")

            }
        }
    }


    fun signUp() {
        viewModelScope.launch {
            _signUpResponse.value = AuthResponse.Loading
            try {
                val request = SignUpRequestBody(
                    name = name.value,
                    email = email.value,
                    password = passwordOne.value
                )
                val result = withContext(Dispatchers.IO) { _signUpApiService.signUp(request) }
                _signUpResponse.value =
                    AuthResponse.Success(result.message, result.token, result.userId)
                dataStoreManager.insertData(
                    mapOf(
                        "token" to (_signUpResponse.value as AuthResponse.Success).token,
                        "userId" to (_signUpResponse.value as AuthResponse.Success).userId
                    )
                )
            } catch (e: Exception) {
                println(e.message)
                _signUpResponse.value = AuthResponse.Error(e.message ?: "An error occurred")
            }
        }
    }
}



