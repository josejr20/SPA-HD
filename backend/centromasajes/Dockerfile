<<<<<<< HEAD
=======
# ===== Stage de build =====
>>>>>>> ec96b0b6088378195e8d7fad0369f1c84dccdeaa
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

<<<<<<< HEAD
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src ./src
=======
# Copia Maven wrapper y pom.xml primero (para caché)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
>>>>>>> ec96b0b6088378195e8d7fad0369f1c84dccdeaa

RUN chmod +x mvnw
<<<<<<< HEAD
=======

# Copia todo el código fuente
COPY src ./src

# Construye el jar sin tests
>>>>>>> ec96b0b6088378195e8d7fad0369f1c84dccdeaa
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
