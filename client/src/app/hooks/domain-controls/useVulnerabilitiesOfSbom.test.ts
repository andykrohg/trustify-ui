import type { AdvisoryHead } from "@app/client";

import {
  buildVexByPurl,
  type VulnerabilityOfSbom,
} from "./useVulnerabilitiesOfSbom";

const makeAdvisory = (overrides: Partial<AdvisoryHead> = {}): AdvisoryHead => ({
  uuid: "adv-uuid-1",
  identifier: "VEX-2024-001",
  hashes: [],
  issuer: null,
  title: null,
  published: null,
  modified: null,
  withdrawn: null,
  labels: {},
  ...overrides,
});

const makeVulnerability = (opts: {
  identifier: string;
  status: VulnerabilityOfSbom["vulnerabilityStatus"];
  purls?: Array<{ uuid: string; purl: string }>;
  advisory?: AdvisoryHead;
}): VulnerabilityOfSbom => {
  const advisory = opts.advisory ?? makeAdvisory();
  const advisories = new Map();
  advisories.set(advisory.identifier, {
    advisory,
    base_score: null,
    scores: [],
    opinionatedScore: null,
    opinionatedExtendedSeverity: "unknown" as const,
  });

  const purls = new Map();
  for (const p of opts.purls ?? []) {
    purls.set(p.uuid, { isOrphan: false, purlSummary: p });
  }

  return {
    vulnerability: {
      identifier: opts.identifier,
      status: opts.status,
      packages: [],
      base_score: null,
      scores: [],
    },
    vulnerabilityStatus: opts.status,
    advisories,
    purls,
    opinionatedAdvisory: {
      advisory,
      score: null,
      extendedSeverity: "unknown",
    },
  };
};

describe("buildVexByPurl", () => {
  it("returns empty map for no vulnerabilities", () => {
    expect(buildVexByPurl([])).toEqual(new Map());
  });

  it("ignores affected entries", () => {
    const result = buildVexByPurl([
      makeVulnerability({
        identifier: "CVE-2024-0001",
        status: "affected",
        purls: [{ uuid: "p1", purl: "pkg:maven/com.example/lib@1.0" }],
      }),
    ]);
    expect(result.size).toBe(0);
  });

  it("ignores under_investigation entries", () => {
    const result = buildVexByPurl([
      makeVulnerability({
        identifier: "CVE-2024-0001",
        status: "under_investigation",
        purls: [{ uuid: "p1", purl: "pkg:maven/com.example/lib@1.0" }],
      }),
    ]);
    expect(result.size).toBe(0);
  });

  it("indexes not_affected entries by vuln ID and PURL", () => {
    const advisory = makeAdvisory({ uuid: "adv-1", identifier: "VEX-001" });
    const result = buildVexByPurl([
      makeVulnerability({
        identifier: "CVE-2024-0001",
        status: "not_affected",
        purls: [{ uuid: "p1", purl: "pkg:maven/com.example/lib@1.0" }],
        advisory,
      }),
    ]);

    expect(result.size).toBe(1);
    const purlMap = result.get("CVE-2024-0001")!;
    expect(purlMap.size).toBe(1);
    const resolution = purlMap.get("pkg:maven/com.example/lib@1.0")!;
    expect(resolution.status).toBe("not_affected");
    expect(resolution.advisory.uuid).toBe("adv-1");
  });

  it("indexes fixed entries", () => {
    const result = buildVexByPurl([
      makeVulnerability({
        identifier: "CVE-2024-0002",
        status: "fixed",
        purls: [{ uuid: "p1", purl: "pkg:maven/com.example/lib@2.0" }],
      }),
    ]);

    const resolution = result
      .get("CVE-2024-0002")!
      .get("pkg:maven/com.example/lib@2.0")!;
    expect(resolution.status).toBe("fixed");
  });

  it("indexes known_not_affected entries", () => {
    const result = buildVexByPurl([
      makeVulnerability({
        identifier: "CVE-2024-0003",
        status: "known_not_affected",
        purls: [{ uuid: "p1", purl: "pkg:maven/com.example/lib@3.0" }],
      }),
    ]);

    const resolution = result
      .get("CVE-2024-0003")!
      .get("pkg:maven/com.example/lib@3.0")!;
    expect(resolution.status).toBe("known_not_affected");
  });

  it("groups multiple PURLs under the same CVE", () => {
    const result = buildVexByPurl([
      makeVulnerability({
        identifier: "CVE-2024-0001",
        status: "not_affected",
        purls: [
          { uuid: "p1", purl: "pkg:maven/com.example/lib-a@1.0" },
          { uuid: "p2", purl: "pkg:maven/com.example/lib-b@1.0" },
        ],
      }),
    ]);

    const purlMap = result.get("CVE-2024-0001")!;
    expect(purlMap.size).toBe(2);
    expect(purlMap.has("pkg:maven/com.example/lib-a@1.0")).toBe(true);
    expect(purlMap.has("pkg:maven/com.example/lib-b@1.0")).toBe(true);
  });

  it("keeps separate entries for different CVEs", () => {
    const result = buildVexByPurl([
      makeVulnerability({
        identifier: "CVE-2024-0001",
        status: "not_affected",
        purls: [{ uuid: "p1", purl: "pkg:maven/com.example/lib@1.0" }],
      }),
      makeVulnerability({
        identifier: "CVE-2024-0002",
        status: "fixed",
        purls: [{ uuid: "p2", purl: "pkg:maven/com.example/other@2.0" }],
      }),
    ]);

    expect(result.size).toBe(2);
    expect(result.has("CVE-2024-0001")).toBe(true);
    expect(result.has("CVE-2024-0002")).toBe(true);
  });

  it("skips orphan PURLs (packages without a PURL)", () => {
    const purls = new Map();
    purls.set("orphan-1", { isOrphan: true, parentName: "some-component" });
    purls.set("p1", {
      isOrphan: false,
      purlSummary: { uuid: "p1", purl: "pkg:maven/com.example/lib@1.0" },
    });

    const vuln = makeVulnerability({
      identifier: "CVE-2024-0001",
      status: "not_affected",
    });
    vuln.purls = purls;

    const result = buildVexByPurl([vuln]);
    const purlMap = result.get("CVE-2024-0001")!;
    expect(purlMap.size).toBe(1);
    expect(purlMap.has("pkg:maven/com.example/lib@1.0")).toBe(true);
  });

  it("skips entries with no advisory", () => {
    const vuln = makeVulnerability({
      identifier: "CVE-2024-0001",
      status: "not_affected",
      purls: [{ uuid: "p1", purl: "pkg:maven/com.example/lib@1.0" }],
    });
    vuln.advisories = new Map();

    const result = buildVexByPurl([vuln]);
    expect(result.get("CVE-2024-0001")?.size ?? 0).toBe(0);
  });

  it("does not include affected-only CVEs in the result", () => {
    const result = buildVexByPurl([
      makeVulnerability({
        identifier: "CVE-2024-0001",
        status: "affected",
        purls: [
          { uuid: "p1", purl: "pkg:maven/com.example/lib-a@1.0" },
          { uuid: "p2", purl: "pkg:maven/com.example/lib-b@1.0" },
        ],
      }),
      makeVulnerability({
        identifier: "CVE-2024-0002",
        status: "not_affected",
        purls: [{ uuid: "p3", purl: "pkg:maven/com.example/lib-c@1.0" }],
      }),
    ]);

    expect(result.has("CVE-2024-0001")).toBe(false);
    expect(result.has("CVE-2024-0002")).toBe(true);
  });
});
