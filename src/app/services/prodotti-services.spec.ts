import { TestBed } from "@angular/core/testing";

import { ProdottiServices } from "./prodotti-services";

describe("ProdottiServices", () => {
  let service: ProdottiServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdottiServices);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
