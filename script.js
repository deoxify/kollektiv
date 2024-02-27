document.getElementById("version").innerText = "v0.3";
const months = "Jan|Feb|Mär|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez".split("|");
const filePicker = document.getElementById("file-picker");
const outputField = document.getElementById("output");
const downloadLink = document.getElementById("download");

function convert(input) {
  const data = [];

  input = input.replace(/^\*\s*/gm, "");
  const sections = input.replace(/[^\S\r\n]+/gm, ",").trim().split(/^\r\n+/gm);
  const date = new Date();
  const dateString = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${date.toLocaleTimeString("de-DE", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true })}`;

  for (let i = 1; i <= sections.length; i += 2) {
    const header = sections[i - 1].trim().split(/\r\n/gm).reduce((acc, prop) => { const [key, value] = prop.split(","); acc[key] = value; return acc }, {});
    const matrices = sections[i].trim().split(/\r\n/gm).map(m => m.split(",").slice(1).reverse());
    data.push({ header: header, matrices: matrices });
  }

  data.sort((a, b) => a.header["Kollektivnummer"] - b.header["Kollektivnummer"]);

  const testnummer = data[0].header["Testnummer"];
  let output = "";

  for (let kollektiv = 1; kollektiv <= data.length; ++kollektiv) {
    let section = "";

    section = `A kollibm jBEAM Auswertung erstellt am ${dateString} \n`;
    section += "C PSNR GW01 \n";
    section += `C TESTNR ${testnummer} \n`;
    section += "C PROGNR - \n";
    section += "C PRUEFL ----------- \n";
    section += "C MSIDS 2 \n";
    section += "C ANZ-PAR 3 \n";
    section += "C KOLL-NR \n";
    section += "C GANG-NR \n";
    section += "C ANZ. DL \n";
    section += "C n_PsA0 U/min \n";
    const kanal_1 = data[kollektiv - 1].header["Kanal_1"];
    const dimension_1 = data[kollektiv - 1].header["Dimension_1"];
    section += ["C", kanal_1, dimension_1].join(" ") + " \n";

    data[kollektiv - 1].matrices.forEach((matrix) => {
      const roundedVal = (Math.round(parseFloat(matrix[0]) * 10) / 10).toFixed(1);
      section += `D    ${kollektiv}    1          0`;
      section += `${" ".repeat(16 - roundedVal.length)}${roundedVal}`;
      section += `${" ".repeat(16 - matrix[1].length)}${matrix[1]} \n`;
    });

    output += section;
  }

  output = outputField.value = output.trim() + " \n";

  downloadLink.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(output));
  downloadLink.setAttribute("download", `${testnummer}.txt`);
  downloadLink.style.visibility = "visible"
}

filePicker.onchange = function () {
  let file = this.files[0];
  let reader = new FileReader();
  reader.readAsText(file, "windows-1254");
  reader.onload = function () {
    convert(reader.result);
    outputField.disabled = false;
  };
}
