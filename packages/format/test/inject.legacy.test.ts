import { describe, it, expect } from "bun:test";
import { injectVariables as iv } from "../src";

describe("variable injection", () => {
  it("should work with simple variables", () => {
    expect(iv("{a}", { a: "b" })).toBe("b");
    expect(iv("start {a} end", { a: "b" })).toBe("start b end");
    expect(iv("start {a} mid {b} end", { a: "b", b: "c" })).toBe("start b mid c end");
    expect(iv("start {a} mid {b} end", { a: "b" })).toBe("start b mid {b} end");
    expect(iv("{a}a{a}y", { a: "b" })).toBe("baby");
  });
  it("should work with plurals", () => {
    expect(iv("{a, plural, one {# item} other {# items}}", { a: 1 })).toBe("1 item");
    expect(iv("{a, plural, one {# item} other {# items}}", { a: 8 })).toBe("8 items");
    expect(iv("{a, plural, one {# item} other {# items}}", { a: 0 })).toBe("0 items");
  });
  it("should work with selection ", () => {
    expect(iv("{a, select, yes {Yes} no {No}}, sir", { a: true })).toBe("Yes, sir");
    expect(iv("{a, select, yes {Yes} no {No}}, sir", { a: 0 })).toBe("No, sir");
  });
  it("should work with complex conditions", () => {
    expect(iv("{a, plural, one {# item} other {# items}}, {b, select, yes {Yes} no {No}}", { a: 1, b: true })).toBe("1 item, Yes");
    expect(iv("{a, plural, =0 {no items} =1 {# item} >1 {# items}}", { a: 0 })).toBe("no items");
    expect(iv("{a, plural, =0 {no items} =1 {# item} =7 {exactly seven items #} >1 {# items}}", { a: 7 })).toBe("exactly seven items 7");
    expect(iv("{a, =0 {no items} =1 {one item} >1&<10 {many items} >=10 {lots of items}}", { a: 10 })).toBe("lots of items");
    expect(iv("Hola {gender, select, ='male' 'señor' 'female' 'señorita'}", { gender: "female" })).toBe("Hola señorita");
    expect(iv("{name, juan juanito sofia sofi laura lau other #}", { name: "laura" })).toBe("lau");
    expect(iv("{name, juan juanito sofia sofi laura lau other #}", { name: "alex" })).toBe("alex");
    expect(iv("{o, debt = 'negative'}", { o: -1 })).toBe("negative");
    expect(iv("{o, 1 = 'one'}", { o: 1 })).toBe("one");
  });
  it("should work with actions", () => {
    expect(iv("{a, list, type:disjunction}", { a: ["a", "b", "c"] })).toBe("a, b, or c");
    expect(iv("{a, currency}", { a: 100 })).toBe(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(100));
    expect(iv("{a, price, currency:COP}", { a: 100 })).toBe(
      new Intl.NumberFormat("en-US", { style: "currency", currency: "COP" }).format(100),
    );
  });
  it("should work nested", () => {
    expect(
      iv(
        "{a, plural, one {# item} !=1 {# items}}, {b, select, a>40 {a lot} Boolean(#)&&{a}>3 {Absolutely yes there is {a, =1 '1 item' >10 '# ITEMS' other {# items}}.} yes {Yes} no {No}}",
        { a: 11, b: 1 },
      ),
    ).toBe("11 items, Absolutely yes there is 11 ITEMS.");
  });
  it("should work with operations", () => {
    expect(iv("{(a - 1)}", { a: 2 })).toBe("1");
    expect(iv("{(2 - 1)}")).toBe("1");
    expect(iv("{(600 *2)}")).toBe("1200");
  });
  it("examples", () => {
    expect(
      iv(
        "{guestCount, <=1 {{host} went alone} 2 {{host} and {guest} went to the party} other {{host}, {guest} and {(guestCount - 1), =1 'one person' other {# people}} went to the party}}",
        {
          guestCount: 4,
          host: "Ivan",
          guest: "Juan",
        },
      ),
    ).toBe("Ivan, Juan and 3 people went to the party");
    expect(
      iv(
        `{gender_of_host, select,   
    female {{num_guests, plural, offset:1 
        =0 {{host} does not give a party.} 
        =1 {{host} invites {guest} to her party.}      
        =2 {{host} invites {guest} and one other person to her party.}    
        other {{host} invites {guest} and # other people to her party.}
      }}
    male {{num_guests, plural, offset:1  
        =0 {{host} does not give a party.}  
        =1 {{host} invites {guest} to his party.}
        =2 {{host} invites {guest} and one other person to his party.}      
        other {{host} invites {guest} and # other people to his party.}
      }}
    other {{num_guests, plural, offset:1 
        =0 {{host} does not give a party.} 
        =1 {{host} invites {guest} to their party.}
        =2 {{host} invites {guest} and one other person to their party.} 
        other {{host} invites {guest} and # other people to their party.}
      }}}`,
        {
          gender_of_host: "male",
          num_guests: 4,
          host: "Ivan",
          guest: "Juan",
        },
      ),
    ).toBe("Ivan invites Juan and 3 other people to his party.");
    expect(
      iv(`On {takenDate, date, short} {name} took {numPhotos, plural, =0 {no photos} =1 {one photo} other {# photos}}.`, {
        name: "John",
        takenDate: new Date(0),
        numPhotos: 0,
      }),
    ).toBe(`On ${new Intl.DateTimeFormat("en", { dateStyle: "short" }).format(new Date(0))} John took no photos.`);
    expect(
      iv(
        `{count, plural,
      =0 {No followers yer}
      =1 {One follower}
      other {# followers}
      }`,
        { count: 1 },
      ),
    ).toBe("One follower");
  });
});
