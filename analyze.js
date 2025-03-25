var fs = require('fs');
var path = require('path');

// Define the source directory to scan for JavaScript files
var srcPath = 'INSERT YOUR PATH HERE';

/**
 * Recursively retrieves all JavaScript files within a given directory.
 * @param {string} dir - The directory to scan.
 * @param {Array} files - The list of JavaScript files found.
 * @returns {Array} - A list of full paths to JavaScript files.
 */
function getAllJsFiles(dir, files) {
    files = files || [];
    fs.readdirSync(dir).forEach(function (file) {
        var fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllJsFiles(fullPath, files); // Recursively scan subdirectories
        } else if (file.endsWith('.js')) {
            files.push(fullPath); // Add JavaScript file to the list
        }
    });
    return files;
}

/**
 * Extracts all `require()` dependencies from a given file content.
 * @param {string} fileContent - The content of a JavaScript file.
 * @returns {Array} - A list of required module names (file names only).
 */
function extractRequires(fileContent) {
    var regex = /require\(['"]([^'"]+)['"]\)/g;
    var matches = [];
    var match;
    while ((match = regex.exec(fileContent)) !== null) {
        matches.push(path.basename(match[1])); // Extract only the file name
    }
    return matches;
}

/**
 * Builds a dependency map linking each required module to the files that import it.
 * @param {Array} files - List of JavaScript files to analyze.
 * @returns {Object} - A dependency mapping object.
 */
function buildDependencyMap(files) {
    var dependencyMap = {};

    files.forEach(function (file) {
        var content = fs.readFileSync(file, 'utf-8');
        var dependencies = extractRequires(content);

        dependencies.forEach(function (dep) {
            if (!dependencyMap[dep]) {
                dependencyMap[dep] = [];
            }
            dependencyMap[dep].push(file); // Map dependency to the files that require it
        });
    });

    return dependencyMap;
}

// Execute the dependency analysis
var allJsFiles = getAllJsFiles(srcPath);
var dependencyMap = buildDependencyMap(allJsFiles);

// Save results to `dependencies.js`
var outputPath = path.join(__dirname, 'dependencies.js');
var outputContent = "var dependencies = " + JSON.stringify(dependencyMap, null, 2) + ";";
fs.writeFileSync(outputPath, outputContent, 'utf-8');

console.log("\n📄 Dependencies map generated in dependencies.js");
