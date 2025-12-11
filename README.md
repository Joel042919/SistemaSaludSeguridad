# Sistema de Salud Ocupacional

Este sistema integral gestiona Admisiones, Citas, Historias Clínicas, Tesorería, Facturación Electrónica y Logística para una clínica de salud ocupacional.

## Requisitos Previos

- **Node.js**: v18 o superior
- **PostgreSQL**: Base de datos relacional
- **Git**

## Instalación

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/Joel042919/SistemaSaludSeguridad.git
    cd seguridadSalud
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

## Configuración (.env)

Copia el archivo `.env.example` a un nuevo archivo llamado `.env` y rellena las variables necesarias:

```bash
cp .env.example .env
```

Variables requeridas:

-   `DATABASE_URL`: Cadena de conexión a PostgreSQL.
    -   Ejemplo: `postgresql://usuario:password@localhost:5432/nombre_db?schema=public`
-   `JWT_SECRET`: Clave secreta para firmar los tokens de sesión.
-   `N8N_WEBHOOK_URL`: URL del webhook (N8N) para enviar las facturas a SUNAT (opcional en desarrollo).

## Base de Datos

El sistema utiliza **Prisma ORM**. Para configurar la base de datos:

1.  **Correr migraciones** (crea las tablas en tu BD):

    ```bash
    npx prisma migrate dev
    ```

2.  **Poblar base de datos (Seed)** (crea usuarios admin, roles y datos iniciales):

    ```bash
    npx prisma db seed
    ```

   > **Nota:** El seed creará un usuario administrador por defecto (revisar `prisma/seed.ts`).

## Ejecutar el Proyecto

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El sistema estará disponible en `http://localhost:3000`.

## Módulos del Sistema

### 1. Admisión
-   **Registro de Pacientes**: Creación y edición de pacientes con foto y documentos.
-   **Gestión de Citas**: Programación de citas asociadas a protocolos de empresas.

### 2. Médico
-   **Historias Clínicas**: Registro de antecedentes, examen físico y diagnósticos.
-   **Aptitud**: Generación de certificados de aptitud médico-ocupacional.

### 3. Laboratorio
-   **Gestión de Exámenes**: Lista de exámenes pendientes por atender.
-   **Resultados**: Ingreso de resultados y cierre de exámenes.

### 4. Tesorería (Facturación)
-   **Punto de Venta (POS)**: Cobro de servicios y generación de comprobantes.
-   **Factura/Boleta**: Generación automática de PDF con estándares SUNAT (RUC, IGV, Monto en letras).
-   **Apertura/Cierre de Caja**: Control de flujo de dinero diario.

### 5. Logística
-   **Inventario**: Control de stock de insumos médicos.
-   **Tracking**: Seguimiento del estado de las citas en tiempo real.

### 6. Administración
-   **Usuarios**: Gestión de usuarios y roles (Médico, Admisión, Tesorería, etc.).
-   **Reportes**: Dashboards de analítica financiera y operativa.
