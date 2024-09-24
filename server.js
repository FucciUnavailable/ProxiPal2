const app = require('./index'); // Adjust the path if necessary
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
