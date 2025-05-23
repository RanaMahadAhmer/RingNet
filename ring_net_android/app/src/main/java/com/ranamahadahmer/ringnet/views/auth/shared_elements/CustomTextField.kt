package com.ranamahadahmer.ringnet.views.auth.shared_elements

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.RemoveRedEye
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.flow.StateFlow


enum class TextFieldType {
    Name,
    Email,
    Password
}

@Composable
fun CustomTextField(
    icon: ImageVector,
    placeHolder: String,
    onChange: (String) -> Unit,
    valueState: StateFlow<String>,
    trailing: @Composable (() -> Unit)? = null,
    type: TextFieldType
) {
    val value by valueState.collectAsState()
    var hidden by remember { mutableStateOf(type == TextFieldType.Password) }
    TextField(
        value,
        visualTransformation = if (hidden) PasswordVisualTransformation(mask = '*') else VisualTransformation.None,
        colors = TextFieldDefaults.colors().copy(
            unfocusedTextColor = Color.Black,
            focusedTextColor = Color.Black,
            focusedPlaceholderColor = Color.Gray,
            unfocusedPlaceholderColor = Color.Gray,
            focusedContainerColor = Color(0xFFE3E1E3),
            unfocusedContainerColor = Color(0xFFE3E1E3),
            focusedLeadingIconColor = Color.Red,
            unfocusedLeadingIconColor = Color.Red,
            focusedTrailingIconColor = Color.Gray,
            unfocusedTrailingIconColor = Color.Gray,
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            cursorColor = Color.Black,
        ),
        trailingIcon = {
            if (type == TextFieldType.Password) {
                Icon(
                    Icons.Outlined.RemoveRedEye,
                    contentDescription = null,
                    modifier = Modifier.clickable {
                        hidden = !hidden
                    })
            } else {
                trailing?.invoke()
            }
        },
        singleLine = true,
        leadingIcon = {
            Icon(icon, contentDescription = null)
        },
        onValueChange = {
            onChange(it)
        },
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth(),
        placeholder = { Text(placeHolder) }
    )
}
