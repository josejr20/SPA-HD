# Base image con Java 17
FROM eclipse-temurin:17-jdk-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de Maven wrapper y pom.xml primero (para cache)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Dar permisos a mvnw
RUN chmod +x mvnw

# Descargar dependencias sin compilar todo
RUN ./mvnw dependency:go-offline

# Copiar el resto del código
COPY src ./src

# Build del jar
RUN ./mvnw clean package -DskipTests

# Comando para ejecutar tu app
CMD ["java", "-jar", "target/centromasajes-0.0.1-SNAPSHOT.jar"]
