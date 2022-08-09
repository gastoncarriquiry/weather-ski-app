let API_KEY = "Insert your API KEY here"; //YOUR API KEY HERE//

let btn_comparar = document.querySelector("#btn_comparar");
let destino1 = document.querySelector("#destino1");
let destino2 = document.querySelector("#destino2");
let ubicDestino1;
let ubicDestino2;
let lat1;
let lon1;
let lat2;
let lon2;
let promedioPrecipitaciones1;
let promedioTemp1;
let promedioPrecipitaciones2;
let promedioTemp2;
let promedioViento1;
let promedioViento2;
let prono1Sent = false;
let prono2Sent = false;

const redondearDecimales = (_valor, _digitosDecimales) => {
  //1 digito->10
  //2 digitos->100
  //3 digitos->1000
  let nroDecimales = 1;
  for (let i = 0; i < _digitosDecimales; i++) {
    nroDecimales = nroDecimales * 10;
  }

  let valorRedondeado = Math.round(_valor * nroDecimales) / nroDecimales;
  return valorRedondeado;
};

arrayCiudades.forEach((destino) => {
  let valueDestino = destino.val;
  let localidadDestino = destino.localidad;
  let paisDestino = destino.pais;

  destino1.insertAdjacentHTML(
    "beforeend",
    `<option value="${valueDestino}">${localidadDestino}, ${paisDestino}</option>`
  );
  destino2.insertAdjacentHTML(
    "beforeend",
    `<option value="${valueDestino}">${localidadDestino}, ${paisDestino}</option>`
  );
});

const obtenerUbicacion = () => {
  ubicDestino1 = destino1.value;
  ubicDestino2 = destino2.value;

  if (ubicDestino1 != "" && ubicDestino2 != "") {
    destino1.style.border = "1px solid transparent";
    destino2.style.border = "1px solid transparent";

    let coordDestino1 = arrayCiudades.filter((destino) => destino.val === ubicDestino1);
    let coordDestino2 = arrayCiudades.filter((destino) => destino.val === ubicDestino2);

    coordDestino1.forEach((destino) => {
      lat1 = destino.lat;
      lon1 = destino.lon;
    });

    coordDestino2.forEach((destino) => {
      lat2 = destino.lat;
      lon2 = destino.lon;
    });

    console.log(lat1);
    console.log(lon1);
    console.log(lat2);
    console.log(lon2);
  } else if (ubicDestino1 != "") {
    destino1.style.border = "1px solid transparent";
  } else if (ubicDestino2 != "") {
    destino2.style.border = "1px solid transparent";
  }
};

const definirDia = (fechaActual) => {
  let fecha = new Date(fechaActual * 1000);
  let dias = ["Dom.", "Lun.", "Mar.", "Mie.", "Jue.", "Vie.", "Sáb."];
  let hoy = dias[fecha.getDay()] + " " + fecha.getDate();
  return hoy;
};

const validarSelects = () => {
  if (ubicDestino1 != ubicDestino2) {
    document.querySelector("#cardDestino1").innerHTML = `<div id="cont-diarios1"></div>`;
    document.querySelector("#cardDestino2").innerHTML = `<div id="cont-diarios2"></div>`;
    buscarPronostico1();
    buscarPronostico2();
    destino1.style.border = "1px solid transparent";
    destino2.style.border = "1px solid transparent";
  } else {
    destino1.style.border = "1px solid red";
    destino2.style.border = "1px solid red";
  }
};

const buscarPronostico1 = () => {
  ubicDestino1 = destino1.value;
  ubicDestino2 = destino2.value;

  let totalTempMax1 = 0;
  let totalPrecipitaciones1 = 0;
  let totalViento1 = 0;

  if (ubicDestino1 != "" && ubicDestino2 != "") {
    document.querySelector("#loader").style.display = "block";
    destino1.style.border = "1px solid transparent";
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat1}&lon=${lon1}&exclude=current,minutely,hourly,alerts&appid=${API_KEY}&lang=es&units=metric`
    )
      .then((r) => r.json())
      .then((infoProno1) => {
        document.querySelector("#loader").style.display = "none";
        if (infoProno1.cod != "404") {
          document.querySelector("#error404").style.display = "none";
          document.querySelector("#cardDestino1").style.display = "block";
          console.log(infoProno1);
          let levantarCiudad = arrayCiudades.filter((destino) => destino1.value === destino.val);
          document.querySelector("#cardDestino1").insertAdjacentHTML(
            "afterbegin",
            `
                        <img src="img/imgLugares/${levantarCiudad[0].src}" alt="${levantarCiudad[0].alt}" class="imgDestino">
                        <h1 class="tituloDestino">${levantarCiudad[0].localidad}, ${levantarCiudad[0].pais}</h1>`
          );

          infoProno1.daily.forEach((pronostico) => {
            document.querySelector("#cont-diarios1").insertAdjacentHTML(
              "beforeend",
              `
                        <article class="pronoDia">
                            <div>
                                <h2>${definirDia(pronostico.dt)}</h2>
                                <img src="img/${pronostico.weather[0].icon}.png" alt="${
                pronostico.weather[0].main
              }" class="icon">
                                <div>
                                    <p>Máx: ${redondearDecimales(pronostico.temp.max, 1)} °C</p>
                                    <p>Mín: ${redondearDecimales(pronostico.temp.min, 1)} °C</p>
                                </div>
                            </div>
                            <div>
                                <p>Vel. del viento: ${redondearDecimales(
                                  pronostico.wind_speed,
                                  1
                                )} m/s</p>
                                <p>Precipitaciones: ${pronostico.pop}%</p>
                            </div>
                        </article>
                        `
            );
            let tempMax = parseFloat(pronostico.temp.max);
            let precipitaciones = parseFloat(pronostico.pop);
            let viento = parseFloat(pronostico.wind_speed);

            totalTempMax1 += tempMax;
            totalPrecipitaciones1 += precipitaciones;
            totalViento1 += viento;
          });
          promedioTemp1 = redondearDecimales(totalTempMax1 / 7, 1);
          promedioPrecipitaciones1 = redondearDecimales(totalPrecipitaciones1 / 7, 2);
          promedioViento1 = redondearDecimales(totalViento1 / 7, 1);
          prono1Sent = true;
          iniciarComparacion();
        } else {
          document.querySelector("#error404").style.display = "inline-block";
        }
      });
  } else if (ubicDestino1 != "") {
    destino1.style.border = "1px solid transparent";
  } else {
    destino1.style.border = "1px solid red";
  }
};

const buscarPronostico2 = () => {
  ubicDestino1 = destino1.value;
  ubicDestino2 = destino2.value;

  let totalTempMax2 = 0;
  let totalPrecipitaciones2 = 0;
  let totalViento2 = 0;

  if (ubicDestino2 != "" && ubicDestino1 != "") {
    document.querySelector("#loader").style.display = "block";
    destino2.style.border = "1px solid transparent";

    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat2}&lon=${lon2}&exclude=current,minutely,hourly,alerts&appid=7c4d35545efb8245cdb4bccb37bf97c0&lang=es&units=metric`
    )
      .then((r) => r.json())
      .then((infoProno2) => {
        document.querySelector("#loader").style.display = "none";
        document.querySelector("#cardDestino2").style.display = "block";
        if (infoProno2.cod != "404") {
          document.querySelector("#error404").style.display = "none";
          console.log(infoProno2);

          let levantarCiudad = arrayCiudades.filter((destino) => destino2.value === destino.val);
          document.querySelector("#cardDestino2").insertAdjacentHTML(
            "afterbegin",
            `
                        <img src="img/imgLugares/${levantarCiudad[0].src}" alt="${levantarCiudad[0].alt}" class="imgDestino">
                        <h1 class="tituloDestino">${levantarCiudad[0].localidad}, ${levantarCiudad[0].pais}</h1>`
          );

          infoProno2.daily.forEach((pronostico) => {
            document.querySelector("#cont-diarios2").insertAdjacentHTML(
              "beforeend",
              `
                        <article class="pronoDia">
                            <div>
                                <h2>${definirDia(pronostico.dt)}</h2>
                                <img src="img/${pronostico.weather[0].icon}.png" alt="${
                pronostico.weather[0].main
              }" class="icon">
                                <div>
                                    <p>Máx: ${redondearDecimales(pronostico.temp.max, 1)} °C</p>
                                    <p>Mín: ${redondearDecimales(pronostico.temp.min, 1)} °C</p>
                                </div>
                            </div>
                            <div>
                                <p>Vel. del viento: ${redondearDecimales(
                                  pronostico.wind_speed,
                                  1
                                )} m/s</p>
                                <p>Precipitaciones: ${pronostico.pop}%</p>
                            </div>
                        </article>
                        `
            );
            let tempMax = parseFloat(pronostico.temp.max);
            let precipitaciones = parseFloat(pronostico.pop);
            let viento = parseFloat(pronostico.wind_speed);

            totalTempMax2 += tempMax;
            totalPrecipitaciones2 += precipitaciones;
            totalViento2 += viento;
          });
          promedioTemp2 = redondearDecimales(totalTempMax2 / 7, 1);
          promedioPrecipitaciones2 = redondearDecimales(totalPrecipitaciones2 / 7, 2);
          promedioViento2 = redondearDecimales(totalViento2 / 7, 1);
          prono2Sent = true;
          iniciarComparacion();
        } else {
          document.querySelector("#error404").style.display = "inline-block";
        }
      });
  } else if (ubicDestino2 != "") {
    destino2.style.border = "1px solid transparent";
  } else {
    destino2.style.border = "1px solid red";
  }
};

const iniciarComparacion = () => {
  if (prono1Sent && prono2Sent) {
    compararPronosticos();
  }
};

const compararPronosticos = () => {
  let levantarCiudad1 = arrayCiudades.filter((destino) => destino1.value === destino.val);
  let levantarCiudad2 = arrayCiudades.filter((destino) => destino2.value === destino.val);
  let puntos1 = 0;
  let puntos2 = 0;

  document.querySelector("#resultadoComparacion").innerHTML = `
        <div id="param-precip">
        </div>
        <div id="param-temp">
        </div>
        <div id="param-viento">
        </div>
    `;

  document.querySelector("#resultadoComparacion").style.display = "block";
  if (promedioPrecipitaciones1 > promedioPrecipitaciones2) {
    puntos1++;
    document.querySelector("#param-precip").insertAdjacentHTML(
      "afterbegin",
      `
            <h3>Probabilidad de nevada (promedio 7 días)</h3>
            <div>
                <p class="mejor">${levantarCiudad1[0].localidad} <br> ${promedioPrecipitaciones1} %</p>
                <p>${levantarCiudad2[0].localidad} <br> ${promedioPrecipitaciones2} %</p>
            </div>
        `
    );
  } else {
    puntos2++;
    document.querySelector("#param-precip").insertAdjacentHTML(
      "afterbegin",
      `
            <h3>Probabilidad de nevada (promedio 7 días)</h3>
            <div>
                <p>${levantarCiudad1[0].localidad} <br> ${promedioPrecipitaciones1} %</p>
                <p class="mejor">${levantarCiudad2[0].localidad} <br> ${promedioPrecipitaciones2} %</p>
            </div>
        `
    );
  }
  if (promedioTemp1 < promedioTemp2) {
    puntos1++;
    document.querySelector("#param-temp").insertAdjacentHTML(
      "afterbegin",
      `
            <h3>Temperaturas más bajas (promedio 7 días)</h3>
            <div>
                <p class="mejor">${levantarCiudad1[0].localidad} <br> ${promedioTemp1} °C</p>
                <p>${levantarCiudad2[0].localidad} <br> ${promedioTemp2} °C</p>
            </div>
        `
    );
  } else {
    puntos2++;
    document.querySelector("#param-temp").insertAdjacentHTML(
      "afterbegin",
      `
            <h3>Temperatura más bajas (promedio 7 días)</h3>
            <div>
                <p>${levantarCiudad1[0].localidad} <br> ${promedioTemp1} °C</p>
                <p class="mejor">${levantarCiudad2[0].localidad} <br> ${promedioTemp2} °C</p>
            </div>
        `
    );
  }
  if (promedioViento1 < promedioViento2) {
    puntos1++;
    document.querySelector("#param-viento").insertAdjacentHTML(
      "afterbegin",
      `
            <h3>Menos viento (promedio 7 días)</h3>
            <div>
                <p class="mejor">${levantarCiudad1[0].localidad} <br> ${promedioViento1} m/s</p>
                <p>${levantarCiudad2[0].localidad} <br> ${promedioViento2} m/s</p>
            </div>
        `
    );
  } else {
    puntos2++;
    document.querySelector("#param-viento").insertAdjacentHTML(
      "afterbegin",
      `
            <h3>Menos viento (promedio 7 días)</h3>
            <div>
                <p>${levantarCiudad1[0].localidad} <br> ${promedioViento1} m/s</p>
                <p class="mejor">${levantarCiudad2[0].localidad} <br> ${promedioViento2} m/s</p>
            </div>
        `
    );
  }

  if (puntos1 > puntos2) {
    document.querySelector("#resultadoComparacion").insertAdjacentHTML(
      "afterbegin",
      `
            <h2>El destino ideal es <span>${levantarCiudad1[0].localidad}, ${levantarCiudad1[0].pais}</span></h2>
        `
    );
  } else {
    document.querySelector("#resultadoComparacion").insertAdjacentHTML(
      "afterbegin",
      `
            <h2>El destino ideal es <span>${levantarCiudad2[0].localidad}, ${levantarCiudad2[0].pais}</span></h2>
        `
    );
  }
};

destino1.addEventListener("change", obtenerUbicacion);
destino2.addEventListener("change", obtenerUbicacion);
btn_comparar.addEventListener("click", validarSelects);
