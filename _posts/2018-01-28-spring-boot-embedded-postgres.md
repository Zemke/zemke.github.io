---
layout:     post
title:      Spring Boot Embedded Postgres
date:       2018-01-28 21:27:13
summary:    You probably won’t use Spring Boot’s default in-memory H2 database in production. You might use Postgres, though. Also, you see the benefit of using the same database in production, development and when unit testing. Here is how to configure an embedded Postgres for your local environment that just starts along with your Spring Boot application.
categories: spring-boot postgres
---

You probably won’t use Spring Boot’s default in-memory H2 database in production. You might use Postgres, though. Also, you see the benefit of using the same database in production, development and when unit testing. Here is how to configure an embedded Postgres for your local environment that just starts along with your Spring Boot application.

## Dependencies

You’ll depend on those:

```xml
<dependency>
    <groupId>ru.yandex.qatools.embed</groupId>
    <artifactId>postgresql-embedded</artifactId>
    <version>2.6</version>
</dependency>
<dependency>
    <groupId>postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>9.1-901-1.jdbc4</version>
</dependency>
```

Since we’re going to create some custom configuration properties, you’ll also need this to process them:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

If the H2 dependency is still in your POM, you can remove it. 👍

## Configuration

Your database connection can be configured in your `application.properties`.

```properties
spring.datasource.url = jdbc:postgresql://127.0.0.1:5432/my-db
spring.datasource.username = my-db
spring.datasource.password = my-db
spring.datasource.driver-class-name = org.postgresql.Driver
spring.datasource.embedded-directory = target
```

Above is configuration according to `DataSourceProperties` except we’ve added the `spring.datasource.embedded-directory` property which points to the directory where your embedded database will be located. `target` is default and makes sense when you’re using Maven, but you might use any path. It’s there so that Postgres won’t be downloaded and extracted every time you run your app, but only once and then reused from that place.

To add that bit, you’ll want to extend Spring Boot’s `DataSourceProperties`.

```java
@Component
@Primary
@Profile("default")
@ConfigurationProperties("spring.datasource")
public class EmbeddedDataSourceProperties extends DataSourceProperties {

    private String embeddedDirectory = "target";

    // Getter, setter...
}

```

We’ve set `@Profile("default")` since you probably don’t want to use an embedded Postgres in production. Consider [profile-specific properties](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html#boot-features-external-config-profile-specific-properties).

`@Primary` is set so that our `EmbeddedDataSourceProperties` take precedence over Spring Boot’s `DataSourceProperties`.

## Data source implementation

Right now Spring Boot would try to connect to the data source specified in `application.properties`. Obviously this data source is not available. Our goal is to free ourselves from the hassle to not only start our Spring Boot application but also a Postgres database.

We implement the data source ourselves. It will also try to connect to the data source like mentioned above, but it will also create that very data source before—our embedded Postgres database.

```java
@Profile("default")
@Configuration
public class DefaultDataSourceConfig {

    @Autowired
    private EmbeddedDataSourceProperties embeddedDataSourceProperties;

    @Bean
    @ConfigurationProperties("spring.datasource")
    @Primary
    public DataSource dataSource() throws IOException {
        URI uri = URI.create(embeddedDataSourceProperties.getUrl().substring(5));
        new EmbeddedPostgres(() -> "9.1.0-1")
                .start(EmbeddedPostgres.cachedRuntimeConfig(
                        Paths.get(embeddedDataSourceProperties.getEmbeddedDirectory())),
                        uri.getHost(), uri.getPort(), uri.getPath().substring(1),
                        embeddedDataSourceProperties.getUsername(),
                        embeddedDataSourceProperties.getPassword(),
                        Collections.emptyList());

        return DataSourceBuilder
                .create()
                .build();
    }
}
```

The properties we’ve set previously are used to create the embedded database and connect to it.

## Troubleshooting

On macOS—possibly others—you might encounter an issue regarding shared memory allocation (`shmget`). You’ll find help [here](https://benscheirman.com/2011/04/increasing-shared-memory-for-postgres-on-os-x/).
