/**
 * Module dependencies.
 */

const path = require('path')

/**
 * Check if it's hidden.
 */
const isPathHidden = (root, targetPath) => {
  const pathParts = targetPath.slice(root.length).split(path.sep);
  for (const part of pathParts) {
    if (part.at(0) === '.') return true;
  }
  return false;
}

/**
 * File type.
 */
const getFileType = (file, ext) => {
  if (ext !== '') return path.extname(path.basename(file, ext));
  return path.extname(file);
}

module.exports = {
  getFileType,
  isPathHidden,
}
