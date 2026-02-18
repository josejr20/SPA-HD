# ===== Stage de build =====
FROM eclipse-temurin:21-jdk-alpine AS build

# Establece directorio de trabajo
WORKDIR /app

# Copia Maven wrapper y pom.xml primero (para caché)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Da permisos al mvnw
RUN chmod +x mvnw

# Copia todo el código fuente
COPY src ./src

# Construye el jar sin tests
RUN ./mvnw clean package -DskipTests

# ===== Stage final =====
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copia el jar generado desde la etapa de build
COPY --from=build /app/target/centromasajes-0.0.1-SNAPSHOT.jar app.jar

# Expone el puerto de Spring Boot
EXPOSE 8080

# Comando para ejecutar la app
CMD ["java", "-jar", "app.jar"]
