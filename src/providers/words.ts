/**
 * Method to convert a word with singular form to plural form (pluralize)
 * - If the singular word is Claf, Half, Knife, Leaf, Life, Loaf, Self, Thief, Wife, Wolf - just remove f/fe and put 'ves' at end of the word
 * - If that word end with 'O,S,X,Z,CH,SH' - put 'es' at end of the word
 * - If that word end with 'consonant + Y' like Fly, Sky, Baby, ... - remove 'y' and input 'ies' at end of the word
 * - For the remaining - put 's' at end of the word
 */

export const pluralize = (singularForm: string) => {
  let pluralizeForm = '';
  const specialWord = [
    'claf',
    'half',
    'knife',
    'leaf',
    'life',
    'loaf',
    'self',
    'thief',
    'wife',
    'wolf',
  ];

  if (!singularForm) {
    return null;
  }

  //If the singular form is already plurialized, do nothing
  if (
    singularForm.endsWith('ies') ||
    singularForm.endsWith('es') ||
    (!singularForm.endsWith('us') &&
      !singularForm.endsWith('ss') &&
      singularForm.endsWith('s'))
  ) {
    return singularForm;
  }

  if (specialWord.includes(singularForm.toLowerCase())) {
    if (singularForm.endsWith('f')) {
      pluralizeForm = `${singularForm.substring(
        0,
        singularForm.length - 1,
      )}ves`;
    } else {
      pluralizeForm = `${singularForm.substring(
        0,
        singularForm.length - 2,
      )}ves`;
    }
  } else if (
    singularForm.endsWith('y') &&
    !singularForm.endsWith('uy') &&
    !singularForm.endsWith('ey') &&
    !singularForm.endsWith('oy') &&
    !singularForm.endsWith('ay')
  ) {
    pluralizeForm = `${singularForm.substring(0, singularForm.length - 1)}ies`;
  } else if (
    singularForm.endsWith('o') ||
    singularForm.endsWith('s') ||
    singularForm.endsWith('x') ||
    singularForm.endsWith('z') ||
    singularForm.endsWith('ch') ||
    singularForm.endsWith('sh')
  ) {
    pluralizeForm = `${singularForm}es`;
  } else {
    pluralizeForm = `${singularForm}s`;
  }

  return pluralizeForm;
};

export const capitalizeFirstLetter = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);
