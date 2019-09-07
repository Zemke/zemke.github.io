---
layout:     post
title:      Firebase Custom Token REST Authentication
summary:    Consume a Firebase real-time database using REST with your own custom token. 
categories: devops
---

{{page.summary}}

Given you have your own backend for authenticating users, you’d still need to use the Firebase Admin SDK to create a custom token.

```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>6.10.0</version>
</dependency>
``` 

Your own backend—Kotlin and Spring Boot in this case—to create a custom token.

```kotlin
@RequestMapping("/firebase-login", method = [RequestMethod.POST])
@Throws(AuthenticationException::class)
fun createAuthenticationTokenForFirebase(
        @RequestBody authRequest: JwtAuthenticationRequest): ResponseEntity<JwtAuthenticationResponse> {
    if (firebaseCredentialsLocation == null) throw RestException("Not configured.", HttpStatus.NOT_FOUND, null)
    authenticationManager.authenticate(UsernamePasswordAuthenticationToken(
            authRequest.username, authRequest.password))
    val firebaseApp = when (FirebaseApp.getApps().isEmpty()) {
        false -> FirebaseApp.getInstance()
        true -> File(firebaseCredentialsLocation).inputStream().use {
            FirebaseApp.initializeApp(FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(it))
                    .build())
        }
    }
    val userDetails = userDetailsService.loadUserByUsername(authRequest.username) as JwtUser<*>
    val additionalClaims = HashMap<String, Any>()
    additionalClaims["username"] = userDetails.username
    additionalClaims["email"] = userDetails.email
    additionalClaims["roles"] = userDetails.roles
    val customToken = FirebaseAuth.getInstance(firebaseApp!!).createCustomToken(
            authRequest.username, additionalClaims)
    return ResponseEntity.ok(JwtAuthenticationResponse(customToken))
}
```

In your client application you’d call this backend which is done with cURL here for reference.

```bash
curl -X POST 'http://localhost:9000/api/auth/firebase-login' -d '{"username": "Zemke", "password": "dev"}'  -H 'Content-Type: application/json'
```

Response:

```json
{"token":"eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImNsYWltcyI6eyJyb2xlcyI6WyJST0xFX1VTRVnbWFpbCk8RSTltevrn_Q-FhwTpHKxK5jb20iLCJ1c2VybmFtZSI6IlplbWtlIn0sImV4cCI6MTU2Nzg4NTkzNCwiaWF0IjoxNTY3ODgyMzM0LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay13MWtsZ0Bjd3QtcXVhbGlmaWVycy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLXcxa2xnQGN3dC1xdWFsaWZpZXJzLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiWmVta2UifQ.T_Adkk4iEgbpoJiwgrwiDHhqZ-VihqZ0zkzRDZeGKwofbmPy7sOmKsSs1UV8YiL16tNPqNjPTDuYeUDGpO7ctzWZzSsHFABaSwuxQNygDWcwY3p2GdCcWSvRUnzFeX-C3rnnXnfcWcSwNJFTKyeIogtBWpdBSEXNEht83gbpCIiLCJST0xFX0FETUlOIl0sImVtYWlsIjoiZmx6ZW1rZUBYmSmMaGIT8AFN4st-33jBprBQm3sBcsZVRYqy4nqa90S4yCBGL0AyGiytc4KjK_enHBkZiovs0oEibxk1rf37oFdMRvumFxlka1zHC0HySf1NAPLeeZPUJgbTDQNERoQM-u4KheRphF2aOcQ3DvrIA"}
```

So, this would’ve been easy. The thing is that this is a **custom token** but you’re actually going to need an **ID token**.  
The Firebase docs go on only describing ways to use one of the client SDKs to then call a Firebase service like a real-time database.

If you want to use REST there’s an undocumented way<sup>1</sup> of exchanging a custom token for an ID token. This can be figured out if you used the one of the client SDKs. You’d notice they send the custom token to an endpoint which then returns an ID token.

Exchange a custom token for an ID token like this:  
Exchange `[APIKEY]` with your project’s API key which you can obtain from the Firebase console. Pass the custom token in the payload. 

```bash
curl -X POST 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=[APIKEY]' -H 'Content-Type: application/json' -d '{"token":"eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImNsYWltcyI6eyJyb2xlcyI6WyJST0xFX1VTRVnbWFpbCk8RSTltevrn_Q-FhwTpHKxK5jb20iLCJ1c2VybmFtZSI6IlplbWtlIn0sImV4cCI6MTU2Nzg4NTkzNCwiaWF0IjoxNTY3ODgyMzM0LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay13MWtsZ0Bjd3QtcXVhbGlmaWVycy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInN1YiI6ImZpcmViYXNlLWFkbWluc2RrLXcxa2xnQGN3dC1xdWFsaWZpZXJzLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwidWlkIjoiWmVta2UifQ.T_Adkk4iEgbpoJiwgrwiDHhqZ-VihqZ0zkzRDZeGKwofbmPy7sOmKsSs1UV8YiL16tNPqNjPTDuYeUDGpO7ctzWZzSsHFABaSwuxQNygDWcwY3p2GdCcWSvRUnzFeX-C3rnnXnfcWcSwNJFTKyeIogtBWpdBSEXNEht83gbpCIiLCJST0xFX0FETUlOIl0sImVtYWlsIjoiZmx6ZW1rZUBYmSmMaGIT8AFN4st-33jBprBQm3sBcsZVRYqy4nqa90S4yCBGL0AyGiytc4KjK_enHBkZiovs0oEibxk1rf37oFdMRvumFxlka1zHC0HySf1NAPLeeZPUJgbTDQNERoQM-u4KheRphF2aOcQ3DvrIA", "returnSecureToken": true}'
```

Response:

```json
{
  "kind": "identitytoolkit#VerifyCustomTokenResponse",
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU0ODZkYTNlMWJmMjA5YzZmNzU2MjlkMWQ4MzRmNzEwY2EzMDlkNTAiLCJ0eXAiOiJKV1QifQ.eyJyb2xlcyI6WyJST0xFX1VTRVIiLgxMTcsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2CJST0xFX0FETUlOIl0sImVtYWlsIjoiZmx6ZW1rZUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6IlplbWtlIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2N3dC1xdWFsaWZpZXJzIiwiYXVkIjoiY3d0LXF1YWxpZmllcnMiLCJhdXRoX3RpbWUiOjE1Njc4ODQ1MTcsInVzZXJfaWQiOiJaZW1rZSIsInN1YiI6IlplbWtlIiwiaWF0IjoxNTY3ODg0NTE3LCJleHAiOjE1Njc4ODluX3Byb3ZpZGVyIjoiY3VzdG9tIn19.rqJ5G6nWvWQFcOaFnnWZIKu2kM9xfDBJ7Hxb6d7fVXxx2DlnSOUy1Vlj9zoSYTGxV8KeCMMhys3GjRT43oIwohdLLlKaQicZG13bTIoc6unFiqqsYLtnoL5x_q0kpybNB92zNd0U10_BcHEWbbz2XPyLnDTdDoP1Jf0TgqxUllBEP5DfV1QtJ5qD_Drx7MU5earg65AwAii4Xx7ggHL0v4AY7j2lswOX1skqkxHRw8Cw_vsvvJ_TjlOoVQSI7v9asBPzfXZEvkuV6Wj7O5XAIgy1LKDFToUOWi2kaKBt_WebxB3eR7f7Ob431wJ1bw3zHhAO-UDPvX-CEDqMV8CvvA",
  "refreshToken": "AEuA4wKQvFZGasdvqEyPQo6vT-FaiRtzdf0WA8Tekfp-nFQxURruQ8YcGqwE3-Jd_3fjMIRGWxe16SlSPGFkxz4iOb5alzXe0lSBFlZv64JErsKbpbh2XkctQUK1071c5PHnJuPjIg2ES7_jDJcYZSHvqiWzACnwtzIIXGGpdIxK-HKjYDYXJgshOGxXShDIlxWhHXGjbIJTVfxB4IL3jQqWDkFS1JgT98-EK57XnNMyYc7u4MiPdySIvcpRbgPWBy9161z3as-D",
  "expiresIn": "3600",
  "isNewUser": false
}
```

You’ve come a long way to do a simple thing but you’ve at least not spent as much time as I did. The `idToken` of this response can be used to pass to the REST queries.  
For instance querying your Firebase real-time database:

```bash
curl 'https://cwt-qualifiers.firebaseio.com/users.json?auth=eyJhbGciOiJSUzI1NiIsImtpZCI6IjU0ODZkYTNlMWJmMjA5YzZmNzU2MjlkMWQ4MzRmNzEwY2EzMDlkNTAiLCJ0eXAiOiJKV1QifQ.eyJyb2xlcyI6WyJST0xFX1VTRVIiLgxMTcsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2CJST0xFX0FETUlOIl0sImVtYWlsIjoiZmx6ZW1rZUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6IlplbWtlIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2N3dC1xdWFsaWZpZXJzIiwiYXVkIjoiY3d0LXF1YWxpZmllcnMiLCJhdXRoX3RpbWUiOjE1Njc4ODQ1MTcsInVzZXJfaWQiOiJaZW1rZSIsInN1YiI6IlplbWtlIiwiaWF0IjoxNTY3ODg0NTE3LCJleHAiOjE1Njc4ODluX3Byb3ZpZGVyIjoiY3VzdG9tIn19.rqJ5G6nWvWQFcOaFnnWZIKu2kM9xfDBJ7Hxb6d7fVXxx2DlnSOUy1Vlj9zoSYTGxV8KeCMMhys3GjRT43oIwohdLLlKaQicZG13bTIoc6unFiqqsYLtnoL5x_q0kpybNB92zNd0U10_BcHEWbbz2XPyLnDTdDoP1Jf0TgqxUllBEP5DfV1QtJ5qD_Drx7MU5earg65AwAii4Xx7ggHL0v4AY7j2lswOX1skqkxHRw8Cw_vsvvJ_TjlOoVQSI7v9asBPzfXZEvkuV6Wj7O5XAIgy1LKDFToUOWi2kaKBt_WebxB3eR7f7Ob431wJ1bw3zHhAO-UDPvX-CEDqMV8CvvA'
```

Pass `idToken` to the `auth` GET param.

In your database rules you can access the claims of that token (see above how I set them) to perform security checks ([Firebase docs on that](https://firebase.google.com/docs/database/security)):

```json
{
  "rules": {
    ".read": "auth.token.username === 'AdminUsername'",
    ".write": false
  }
}
```

In the last call you had also received a `refreshToken` which you can conclusively use to refresh your token.  
Bear in mind that the content type is `application/x-www-form-urlencoded` and not JSON. Replace `[APIKEY]` again.

```bash
    curl -X POST 'https://securetoken.googleapis.com/v1/token?key=`[APIKEY]`' -d 'grant_type=refresh_token&refresh_token=AEuA4wKQvFZGasdvqEyPQo6vT-FaiRtzdf0WA8Tekfp-nFQxURruQ8YcGqwE3-Jd_3fjMIRGWxe16SlSPGFkxz4iOb5alzXe0lSBFlZv64JErsKbpbh2XkctQUK1071c5PHnJuPjIg2ES7_jDJcYZSHvqiWzACnwtzIIXGGpdIxK-HKjYDYXJgshOGxXShDIlxWhHXGjbIJTVfxB4IL3jQqWDkFS1JgT98-EK57XnNMyYc7u4MiPdySIvcpRbgPWBy9161z3as-D' -H 'Content-Type: application/x-www-form-urlencoded'
```

Example response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU0ODZkYTNlMWJmMjA5YzZmNzU2MjlkMWQ4MzRmNzEwY2EzMDlkNTAiLCJ0eXAiOiJKV1QifQ.eyJpc0FkbWluIjp0cnVlLCJlbWFpbCI6ImZsemVta2VAZ21haWwuY29tIiwidXNlcm5hbWUiOiJaZW1rZSIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9jd3QtcXVhbGlmaWVycyIsImF1ZCI6ImN3dC1xdWFsaWZpZXJzIiwiYXV0aF90aW1lIjoxNTY3ODg2OTI0LCJ1c2VyX2lkIjoiWmVta2UiLCJzdWIiOiJaZW1rZSIsImlhdCI6MTU2Nzg4NzEwMCwiZXhwIjoxNTY3ODkwNzAwLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImN1c3RvbSJ9fQ.cq2FYOjZjyKhTbBpMSu9ejBY9vgK9lTx2tUdH2W7TyN183pr1ntvOMggrpHwRqUocRp3L3Kfx4fUQFU-zj8bRoJy4YKiqgX90JhlGQP_VbBWjkdFzpBKmn3xesWCuQnRjit3rBVarFM49h0cuoKcOrlxBfz4koezOlqBscixpqf-VRvUhTmaGfSy8tkNxqBaN7ptchVVVXLkSAJE5m0KYs8FqSEaNUlzJxtpzcY-rakXaRVbXBT_X5mr40ZRT9Rly78yZsZn4YeGOe8POqPPsi42etQSMMIjPmxUteN3NoWAdS_KgbPLhxj0NFs5FLLfVYYJLK3MhdI4OgRs_wL_NA",
  "expires_in": "3600",
  "token_type": "Bearer",
  "refresh_token": "AEu4IL1DC6vkrgujNY5k5L24y0utIwBb0Gx-CjTb6Yvj1kWhYPZ_DYDhIDg2BuIUO6OneKPoLgxXiEZRfeRkDEZRt7qdFNYzw4Po_dLQJKXbZWIWpLXlx_OsjmRVxY_xXCn6huNSfvzbA64yla3i-dRTU3BgTyzASNj0v21ZSOOMJ0nMfsw2q5eH0AXZsw1OV6sPcCJ03sIoQoydZHdDYuu2uOIPlsg5MKP8RWswcgcAJaiTLvy5Lgw",
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjU0ODZkYTNlMWJmMjA5YzZmNzU2MjlkMWQ4MzRmNzEwY2EzMDlkNTAiLCJ0eXAiOiJKV1QifQ.eyJpc0FkbWluIjp0cnVlLCJlbWFpbCI6ImZsemVta2VAZ21haWwuY29tIiwidXNlcm5hbWUiOiJaZW1rZSIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9jd3QtcXVhbGlmaWVycyIsImF1ZCI6ImN3dC1xdWFsaWZpZXJzIiwiYXV0aF90aW1lIjoxNTY3ODg2OTI0LCJ1c2VyX2lkIjoiWmVta2UiLCJzdWIiOiJaZW1rZSIsImlhdCI6MTU2Nzg4NzEwMCwiZXhwIjoxNTY3ODkwNzAwLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImN1c3RvbSJ9fQ.cq2FYOjZjyKhTbBpMSu9ejBY9vgK9lTx2tUdH2W7TyN183pr1ntvOMggrpHwRqUocRp3L3Kfx4fUQFU-zj8bRoJy4YKiqgX90JhlGQP_VbBWjkdFzpBKmn3xesWCuQnRjit3rBVarFM49h0cuoKcOrlxBfz4koezOlqBscixpqf-VRvUhTmaGfSy8tkNxqBaN7ptchVVVXLkSAJE5m0KYs8FqSEaNUlzJxtpzcY-rakXaRVbXBT_X5mr40ZRT9Rly78yZsZn4YeGOe8POqPPsi42etQSMMIjPmxUteN3NoWAdS_KgbPLhxj0NFs5FLLfVYYJLK3MhdI4OgRs_wL_NA",
  "user_id": "Zemke",
  "project_id": "99484621986791986"
}
```

<sup>1</sup> Documentation to [exchange custom token for an ID and refresh token](https://firebase.google.com/docs/reference/rest/auth#section-verify-custom-token) has actually been added.
