# Prototipo de Sistema de valoración QR-TAXI

Este es el código del prototipo que se realizó en el Taller [El Taxi Experimenta](https://www.medialab-prado.es/proyectos/sistema-de-valoracion-del-servicio-en-el-taxi) de MediaLab Prado.


Iremos actualizando este repositorio conforme vaya avanzando el proyecto.

> ADVERTENCIA : Es una prueba de concepto. Evidentemente necesita mejoras, y la idea es seguir mejorándolo hasta tener un sistema listo para ponerlo en producción.


# Demo

[![Watch the video](https://img.youtube.com/vi/CUJ-cchv8FI/hqdefault.jpg)](https://youtu.be/CUJ-cchv8FI)


# Requisitos

- Tener [nodeJS](https://nodejs.org/es/) instalado.


# Instalación

Abre un terminal, y ejecuta las siguientes instrucciones.

```bash
git clone https://github.com/ntkog/taxiexperimenta
cd taxiexperimenta
npm i
SESSION_SECRET=test node app.js
```

# Provisión de usuarios

1. Una vez hayas ejecutado estos comandos, abre un navegador e introduce la siguiente dirección

```bash
http://localhost:3000/signup
```

2. Rellena los datos de formulario. Unos datos de ejemplo podrían ser:

- **Username** : prueba
- **Password** : test
- **Confirm Password** : test
- **Matricula** : 1234-TXM

3. Introduce la siguiente dirección para entrar en el sistema, y rellena los datos que te pide.

```bash
http://localhost:3000/login
```

4. Ve a la siguiente dirección

```bash
http://localhost:3000/profile
```

Aparecerá tu **QRCODE** para poder descargártelo. También aparecerá una secuencia de números.

5. Escanea tu **QRCODE** , te llevará directamente al formulario de valoración.
