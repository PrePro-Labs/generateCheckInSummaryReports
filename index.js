function main() {
  try {
    console.log("---------- STARTING PROCESS ----------");
    console.log("---------- ENDING PROCESS (success) ----------");
  } catch (error) {
    console.log(error);
    console.log("---------- ENDING PROCESS (error) ----------");
  }
}
