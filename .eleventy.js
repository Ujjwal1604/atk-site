module.exports = function (eleventyConfig) {
  // Shortcode to get the current year for the footer
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Copy the entire "css" folder, as-is, to the output
  eleventyConfig.addPassthroughCopy("css");

  // Copy the "images" and "js" folders to the output
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("js");

  // Copy the "decap admin" folder to the output
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("download.html");
  eleventyConfig.addPassthroughCopy("editor.html");
  const prefix = process.env.PATH_PREFIX || "/atk/";

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "public"
    },
    pathPrefix: prefix  // 🔴 THIS is critical
  };
};
