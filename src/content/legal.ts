/** A legal page's copy: its hero, when it was last revised, and its numbered clauses. */
export type LegalSection = {
  /** The clause number, as on the production page ("1" to "34"). */
  num: string;
  title: string;
  /**
   * The clause body as HTML: lists (<ol>, <ul>, <li>), <p>, <strong>, <em>, <a> and <br> only. Our own copy, lifted
   * from the production legal pages, so it is trusted and rendered as it is.
   */
  html: string;
};

export type LegalDoc = {
  titleOne: string;
  titleTwo: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
};
