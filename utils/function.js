exports.generateId = (count) => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let hexID = "";

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    hexID += characters[randomIndex];
  }

  return hexID;
};

exports.uniqueId = (length) => {
  return parseInt(
    Math.ceil(Math.random() * Date.now())
      .toPrecision(length)
      .toString()
      .replace(".", "")
  );
};

exports.formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
