# Dependency Analysis Tool

This tool analyzes the dependencies in your project, specifically focusing on components used with `require()` in Node.js. It allows you to:

- Select components from a dynamically generated dropdown list.
- View a list of files that require each component.
- Filter results based on the selected component.

## Features

- **Responsive design**: The tool is fully responsive, adjusting to different screen sizes.
- **Interactive UI**: With hover effects and badges displaying the associated component names.
- **Real-time filtering**: Display files based on the selected component with dynamic updating.

## How It Works

The tool loads a JSON-like object (`dependencies.js`) containing your project's components and their respective files. When a user selects a component from the dropdown menu, the files that `require()` that component are displayed in a list.

## Installation

1. Clone or download the repository.
2. Ensure that you have the required `analyze.js` file with your project’s data.
3. Modify the script to add your path to src/views
4. Execute the script ```node analyze.js```
5. Open `index.html` in a browser.

## Usage

1. Select a component from the dropdown.
2. View the list of files that require the selected component.
3. Hover over the files for an enhanced user experience.

## Technologies Used

- **HTML5** for structure.
- **CSS** (via Bootstrap 5) for styling.
- **JavaScript (ES5)** for dynamic behavior.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

