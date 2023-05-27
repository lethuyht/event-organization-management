import { pluralize } from './words';

describe('pluralize a singular word', () => {
  describe(`pluralize special words`, () => {
    describe(`pluralize word knife`, () => {
      it(`should return knives`, async () => {
        expect(pluralize('knife')).toEqual('knives');
      });
    });
    describe(`pluralize word wolf`, () => {
      it(`should return wolves`, async () => {
        expect(pluralize('wolf')).toEqual('wolves');
      });
    });
  });

  describe(`pluralize plural words`, () => {
    describe(`pluralize word skies`, () => {
      it(`should return skies`, async () => {
        expect(pluralize('skies')).toEqual('skies');
      });
    });
    describe(`pluralize word days`, () => {
      it(`should return days`, async () => {
        expect(pluralize('days')).toEqual('days');
      });
    });
  });

  describe(`pluralize a normal word`, () => {
    describe(`pluralize word day`, () => {
      it(`should return days`, async () => {
        expect(pluralize('day')).toEqual('days');
      });
    });
    describe(`pluralize word home`, () => {
      it(`should return homes`, async () => {
        expect(pluralize('home')).toEqual('homes');
      });
    });
  });

  describe(`pluralize words end with 'consonant + Y`, () => {
    describe(`pluralize word baby`, () => {
      it(`should return babies`, async () => {
        expect(pluralize('baby')).toEqual('babies');
      });
    });
    describe(`pluralize word fly`, () => {
      it(`should return flies`, async () => {
        expect(pluralize('fly')).toEqual('flies');
      });
    });
  });

  describe(`pluralize word end with 'O,S,X,Z,CH,SH'`, () => {
    describe(`pluralize word shoe`, () => {
      it(`should return shoes`, async () => {
        expect(pluralize('shoe')).toEqual('shoes');
      });
    });
    describe(`pluralize word kiss`, () => {
      it(`should return kisses`, async () => {
        expect(pluralize('kiss')).toEqual('kisses');
      });
    });
    describe(`pluralize word buzz`, () => {
      it(`should return buzzes`, async () => {
        expect(pluralize('buzz')).toEqual('buzzes');
      });
    });
    describe(`pluralize word watch`, () => {
      it(`should return watches`, async () => {
        expect(pluralize('watch')).toEqual('watches');
      });
    });
    describe(`pluralize word watsh`, () => {
      it(`should return watshes`, async () => {
        expect(pluralize('watsh')).toEqual('watshes');
      });
    });
  });
});
