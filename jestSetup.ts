process.on("unhandledRejection", (error): void => {
  throw error;
});
