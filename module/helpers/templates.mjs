/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
	"systems/fwo/templates/actor/parts/actor-ability.html",
	"systems/fwo/templates/actor/parts/actor-defenses.html",
	"systems/fwo/templates/actor/parts/actor-derived.html",
	"systems/fwo/templates/actor/parts/actor-enemy-numbers.html",
    "systems/fwo/templates/actor/parts/actor-effects.html",
    "systems/fwo/templates/actor/parts/actor-features.html",
	"systems/fwo/templates/actor/parts/actor-resources.html",
    "systems/fwo/templates/actor/parts/actor-items.html",
	"systems/fwo/templates/actor/parts/actor-enemy-items.html",
	"systems/fwo/templates/actor/parts/actor-levels.html",
    "systems/fwo/templates/actor/parts/actor-skills.html"
  ]);
};
