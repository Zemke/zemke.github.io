---
layout:     post
title:      AspectJ and Kotlin
summary:    Getting AspectJ to work with Kotlin using post-compile weaving of Aspects and Mojo AspectJ Maven plugin.
categories: misc kotlin
---

{{page.summary}}

```xml
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjrt</artifactId>
    <version>1.8.13</version>
</dependency>
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.8.13</version>
</dependency>
```

## Mojo AspectJ Maven plugin config

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>aspectj-maven-plugin</artifactId>
    <version>1.11</version>
    <configuration>
        <complianceLevel>1.8</complianceLevel>
        <source>1.8</source>
        <target>1.8</target>
        <showWeaveInfo>true</showWeaveInfo>
        <verbose>true</verbose>
        <Xlint>ignore</Xlint>
        <encoding>UTF-8</encoding>
        <forceAjcCompile>true</forceAjcCompile>
        <weaveDirectories>
            <weaveDirectory>${project.build.outputDirectory}</weaveDirectory>
            <weaveDirectory>${project.build.testOutputDirectory}</weaveDirectory>
        </weaveDirectories>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>test-compile</goal>
                <goal>compile</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

Nothing too special. The part that took me is the `weaveDirectories`. You want to weave the compiled `class` files that were generated using `maven-compiler-plugin`. \
Generally speaking the idea is to use post-compile weaving of aspects. It’s a good idea to put the plugin definition last in the `plugins` directive. Definitely make sure it’s after the compilation. Also setting `forceAjcCompile` to `true` makes a difference.

### No Java >8 support

Unfortunately there’s no support for Java >8 by the `aspectj-maven-plugin` plugin. There are unmerged pull requests if you really want to go for it.
