---
layout:     post
title:      RestTemplate Logging Interceptor
summary:    External API integrations can be a source of unexpected behavior and one will have a vastly easier troubleshooting if only there had been proper logging. Spring Boot’s `RestTemplate` allows for interceptors which is just perfect to do some logging.
categories: spring-boot
---

{{page.summary}}

```kotlin
RestTemplateBuilder().interceptors(object : ClientHttpRequestInterceptor {
    override fun intercept(request: HttpRequest, body: ByteArray,
                           execution: ClientHttpRequestExecution): ClientHttpResponse {
        logger.info("""
            method: ${request.method}
            uri: ${request.uri}
            headers: ${request.headers}
            body: ${body.toString(Charset.defaultCharset())}""".trimIndent())
        val response = execution.execute(request, body)
        logger.info("""
            statusCode: ${response.statusCode}
            headers: ${response.headers}
            body: ${response.body.bufferedReader().use { it.readText() }}""".trimIndent())
        return response
    }
})
```

