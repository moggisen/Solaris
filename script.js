// Denna väntar tills HTML dokumenter laddats
document.addEventListener("DOMContentLoaded", async () => {
  // Denna gör att jag får tillgång till alla information jag vill ska visas på sidan
  // Använder querySelector just för att få mer flexibilitet när det kommer till CSS
  const planetInfo = document.querySelector(".planet-info");
  const planetHeading = document.querySelector(".planet-name");
  const latinName = document.querySelector(".latin-name");
  const description = document.querySelector(".description");
  const circumference = document.querySelector(".circumference");
  const distance = document.querySelector(".distance");
  const nightTemp = document.querySelector(".night-temp");
  const dayTemp = document.querySelector(".day-temp");
  const searchInput = document.querySelector(".search-input");
  const planetElements = document.querySelectorAll(".planet");
  const orbitalPeriodElement = document.querySelector(".orbital-period");
  const rotationElement = document.querySelector(".rotation");

  // Denna kommer att visa meddelandet när ingen planet matchas
  const noMatchMessage = document.getElementById("no-match-message");

  // En funktion som hämtar API-nyckeln
  async function getApiKey() {
    try {
      //Hämtar API-nycklen som vi skulle använda oss av plus att jag fått lägga till en CORS för att de skulle fungera
      const response = await fetch(
        //await väntar på svaret från servern samt fetch skickar en HTTP-begäran till angiven URL
        "https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/keys",
        {
          method: "POST", // Detta är en POST-förfrågan som kommer att skickas (Post används för att skicka data till en server)
        }
      );
      if (!response.ok) throw new Error("Failed to fetch API key");
      const data = await response.json(); //Fungerar det omvandlas svaret till JSON
      return data.key;
    } catch (error) {
      console.error("Error fetching API key:", error); //Skriver ut meddelandet om något gått fel
    }
  }

  // En funktion som hämtar data från API
  async function fetchPlanets(apiKey) {
    //Funktionene tar en parameter, apiKey som innehåller API-nyckeln som krävs för att autentisera begäran
    try {
      //startar en try-catch-block för att hantera eventuella fel som uppstår när funktionen körs
      const response = await fetch(
        //Skickar en HTTP-begäran med fetch await pausar exekveringen tills servern svarar
        "https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/bodies",
        {
          method: "GET", //En GET betyder att att vi hämtar data från servern utan att ändra något
          headers: { "x-zocom": apiKey }, //API-nyckeln skickas som header i begäran
        }
      );
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json(); // Om allt funkar retuneras datan till JSON
      return data;
    } catch (error) {
      console.error("Error fetching planets:", error);
    }
  }

  // Uppdatera planetinformationen
  //Denna funktion uppdaterar de olika elementen på sidan med information om en planet, om den inte finns sätts texten till meddelandet att planeten inte finns
  function updatePlanetInfo(planet) {
    if (!planet) {
      planetHeading.innerText = "Planet not found.";
      description.innerText = "We could not find information for this planet.";
      planetInfo.classList.remove("visible");
      return;
    }

    //Här uppdateras dom olika HTML-elementen med information som hämtas från API:et
    //Denna ger också ut text innan informationen som tillexempel omkrets
    planetHeading.innerText = planet.name || "Okänd planet";
    latinName.innerText = planet.latinName || "Okänt latinskt namn";
    description.innerText = planet.desc || "Ingen beskrivning tillgänglig.";
    circumference.innerText = `Omkrets: ${planet.circumference || "okänd"} km`;
    distance.innerText = `Avstånd från solen: ${planet.distance || "0"} km`;

    nightTemp.innerText = `Temperaturen under natten är: ${
      planet.temp?.night || "okänd"
    }°C`;
    dayTemp.innerText = `Temperaturen under dagen är: ${
      planet.temp?.day || "okänd"
    }°C`;
    rotationElement.textContent = `Antal jorddygn runt sin egen axel: ${
      planet.rotation || "okänd"
    } `;
    orbitalPeriodElement.innerText = `Antal jorddygn runt solen: ${
      planet.orbitalPeriod || "0"
    } dagar`;

    planetInfo.classList.add("visible"); //Denna lägger till en CSS-klass och gör att den antingen visa eller dölja element beroende på om data laddas eller inte
  }

  //Laddar all information först hämtas API-nyckelnn via getApiKeyoch väntar tills den är klar
  //Om ingen API-nyckel returneras (om det gick fel) avslutas funktionen tidigt
  async function loadSolarSystemData() {
    const apiKey = await getApiKey();
    if (!apiKey) return;

    //Hämtar planetdata med FetchPlanets som lagras i variabeln planets
    //om ingen data retuneras, eller om det inte finns några "bodies" i datan så avslutas funktionen
    const planets = await fetchPlanets(apiKey);
    if (!planets || !planets.bodies) return;

    //Denna kod används för att hämta namnet på den aktuella planetens sida från URL:en
    const pathname = window.location.pathname;
    const planetName = pathname.split("/").pop().replace(".html", "");

    //Denna kod söker i fata (planets.bodies efter planeten vars namn matchar det som hämtas från URL:en)
    const planet = planets.bodies.find(
      (p) => p.name.toLowerCase().trim() === planetName.toLowerCase().trim()
    );
    updatePlanetInfo(planet);
  }

  // Ladda data från API:et och visa relevant information om den valda planeten
  loadSolarSystemData();

  // Klickhändelse för planeter

  planetElements.forEach((planet) => {
    //Loopar igenom alla element i planetElements
    planet.addEventListener("click", () => {
      // När användaren klickar på en av planeterna och omdirigeras till ny sida baserat på vilken planet användaren valde
      const planetName = planet.dataset.name; // Använder dataset.name för att hämta planetens namn från data.attributet
      if (!planetName) {
        //Kontrollerar om planetName är null,undefined eller en tom sträng, !planetNAme betyder Om det inte finnns något värde i planetName
        console.error("Planet data attribute is missing."); //Loggar ett felmeddelande i konsollen om data-name saknas
        return; //Avslutar funktionen om data-name saknas
      }
      window.location.href = `${planetName.toLowerCase()}.html`; //Omdirigerar webbsidan till en ny URL baserat på planetens namn
      //.html lägger till filhändelsen för att skapa den nya URL:en, namnet mars omvandlas till mars.html
    });
  });

  // Sökfunktion
  //Visar planeten användaren söker på söker den på nån som inte finns visar den ett meddalnde om att den inte matchar
  if (searchInput && planetElements.length > 0) {
    //Kontrollerar att både sökfältet (searchInput och listan över planeter (planetElements) existerar
    searchInput.addEventListener("input", function () {
      //När användaren skriver in något i sökfältet körs funktionen
      const searchValue = searchInput.value.toLowerCase().trim(); //Hämtar det aktuella värdet som söks på med SearchInputvalue
      //toLowerCase gör att sökningen blir skiftlägesokänslig att oavsett hur du stavar planetens namn stor eller små kommer den visas
      //trim tar bort eventuella extra mellanslag i början och slutet av strängen
      let matchFound = false; //En variabel som håller reda på om någon planet matchar söksträngen börjar med false alltså ingen match funnen
      planetElements.forEach((planet) => {
        const planetName = planet.dataset.name.toLowerCase(); //Hämtar värdet av data-name attributet för planeten (t.ex. Mars)

        if (planetName.includes(searchValue)) {
          //Använder includes för att kontrollera om searchValue finns i planetName. OM det finns en match (t.ex "ma" i Mars) så döljs inte planeten
          planet.style.display = "block"; //Om det finns en match visas planeten pga block
          matchFound = true; // om planeten matchar sätts loopen till true
        } else {
          planet.style.display = "none"; // OM det inte finns en match döljs planeten pga none
        }
      });

      // Om ingen planet hittas
      if (!matchFound) {
        // Denna står för FALSE alltså om en planet inte hittas
        noMatchMessage.style.display = "block"; // Denna gör att meddelandet visas om en planet inte hittas
        noMatchMessage.innerText = "Ingen planet matchar din sökning."; //Meddelandet som visas när en inte hittas
      } else {
        noMatchMessage.style.display = "none"; // Dölj meddelandet om det finns en match
      }
    });
    // Förhindra att formuläret skickas när användaren trycker på Enter
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Stoppar formuläret från att skickas och sidan laddas om
        // Här kan du lägga till din sökfunktionalitet
        searchPlanet();
      }
    });
  }
});
