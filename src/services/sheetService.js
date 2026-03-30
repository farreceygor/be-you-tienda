const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSRoJZT52xCvLQgu6pYQtNmnb5YKiRGsVQmDNe4ir49oeJXWHjWlWICKYmDNaCc10jZ82_i0E6Vm_iA/pub?gid=0&single=true&output=csv";

export async function fetchProductos() {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.text();
    const rows = data.split('\n').slice(1);

    const limpiarNum = (val) => {
      if (!val) return "0";
      return val.replace(/[$.]/g, "").replace(',', '.').trim();
    };

    return rows.map(row => {
      const c = row.split(',');
      if (c.length < 5) return null;
      return {
        id: c[0].trim(),
        nombre: c[1].trim(),
        precio: parseFloat(limpiarNum(c[2])) || 0,
        stock: parseInt(limpiarNum(c[3])) || 0,
        img: c[4].trim()
      };
    }).filter(p => p !== null && p.nombre !== "");
  } catch (error) {
    console.error("Error cargando Sheet:", error);
    return [];
  }
}