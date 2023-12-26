const eleventySass = require("@11tyrocks/eleventy-plugin-sass-lightningcss");
const { DateTime } = require("luxon");
const timeToRead = require('eleventy-plugin-time-to-read');
const markdownIt = require("markdown-it");
const markdownItAttrs = require('markdown-it-attrs');


module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass);
  eleventyConfig.addPlugin(timeToRead);
  eleventyConfig.addPlugin(
    require('@photogabble/eleventy-plugin-interlinker'),
    {
      defaultLayout: 'layouts/embed.liquid'
    }
  );

  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/assets");

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);


  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });
  eleventyConfig.addFilter("monthDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('LLL yyyy');
  });

  eleventyConfig.addFilter("yearMonth", (dateObj) => {
    return DateTime.fromISO(dateObj).toFormat('yyyy LLL');
  });

  eleventyConfig.addFilter("dayMonthDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('dd LLL');
  });


  	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", collection => {
		let tagSet = new Set();
		for(let item of collection) {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
	});

  

  const markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAttrs, {
  // optional, these are default options
  leftDelimiter: '{',
  rightDelimiter: '}',
  allowedAttributes: []  // empty array = all attributes are allowed
});

  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });


  // Blog archive - https://github.com/11ty/eleventy/issues/1284
  eleventyConfig.addCollection("postsByYear", (collection) => {
    const posts = collection.getFilteredByTag('posts').reverse();
    const years = posts.map(post => post.date.getFullYear());
    const uniqueYears = [...new Set(years)];
  
    const postsByYear = uniqueYears.reduce((prev, year) => {
      const filteredPosts = posts.filter(post => post.date.getFullYear() === year);
  
      return [
        ...prev,
        [year, filteredPosts]
      ]
    }, []);
  
    return postsByYear;
  });

  

  return {
    dir: {
      input: "src",
      output: "docs",
    },
  };
};