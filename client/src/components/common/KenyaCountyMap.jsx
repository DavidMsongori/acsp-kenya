
import { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import rewind from "@mapbox/geojson-rewind";

import counties from "../../assets/maps/kenya-counties.json";
import "./KenyaCountyMap.css";

const MAP_WIDTH = 560;
const MAP_HEIGHT = 620;

const KenyaCountyMap = ({
  interactive = false,
  selectedCountyId = null,
  selectedCountyName = null,
  singleCounty = false,
  highlightedCountyNames = [],
  onCountyHover,
  onCountySelect,
}) => {
  const countyPaths = useMemo(() => {
    const correctedCounties = rewind(counties, true, false);

    const projection = geoMercator().fitExtent(
      [[25, 20], [535, 585]],
      correctedCounties
    );

    const pathGenerator = geoPath().projection(projection);

   return correctedCounties.features.map((county, index) => ({
  id: county.properties?.shapeISO || `county-${index}`,
  name: county.properties?.shapeName || "County",
  path: pathGenerator(county),
  feature: county,
}));
  }, []);

  const displayedCountyPaths = useMemo(() => {
  if (!singleCounty || !selectedCountyName) {
    return countyPaths;
  }

  const selectedCounty = countyPaths.find(
    (county) =>
      county.name.trim().toLowerCase() ===
      selectedCountyName.trim().toLowerCase()
  );

  if (!selectedCounty) return [];

  const projection = geoMercator().fitExtent(
    [[20, 20], [MAP_WIDTH - 20, MAP_HEIGHT - 20]],
    selectedCounty.feature
  );

  const pathGenerator = geoPath().projection(projection);

  return [
    {
      ...selectedCounty,
      path: pathGenerator(selectedCounty.feature),
    },
  ];
}, [countyPaths, singleCounty, selectedCountyName]);

  const handleCountyKeyDown = (event, county) => {
    if (!interactive) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onCountySelect?.(county);
    }
  };

  return (
    <div
      className={`kenya-map-wrapper ${
        interactive ? "kenya-map-interactive" : ""
      }`}
    >
      <div className="kenya-map-panel">
        <svg
          className="kenya-county-map"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Interactive map of Kenya showing all 47 counties"
          xmlns="http://www.w3.org/2000/svg"
          onMouseLeave={() => onCountyHover?.(null)}
        >
          <defs>
            <filter
              id="kenya-map-glow"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#kenya-map-glow)">
            {displayedCountyPaths.map((county) => (
              <path
                key={county.id}
                d={county.path}
               className={`kenya-county-shape ${
  interactive ? "interactive-county" : ""
} ${
  highlightedCountyNames.includes(
    county.name.trim().toLowerCase()
  )
    ? "has-activities"
    : ""
} ${
  (
    selectedCountyName
      ? selectedCountyName.trim().toLowerCase() ===
        county.name.trim().toLowerCase()
      : selectedCountyId === county.id
  )
    ? "selected-county"
    : ""
}`}
                tabIndex={interactive ? 0 : undefined}
                role={interactive ? "button" : undefined}
                aria-label={`${county.name} County`}
                aria-pressed={
                  interactive
                    ? selectedCountyId === county.id
                    : undefined
                }
                onMouseEnter={() =>
                  interactive && onCountyHover?.(county)
                }
                onClick={() =>
                  interactive && onCountySelect?.(county)
                }
                onKeyDown={(event) =>
                  handleCountyKeyDown(event, county)
                }
              >
                <title>{county.name} County</title>
              </path>
            ))}
          </g>
        </svg>
      </div>

      <div className="kenya-map-caption">
        <span className="kenya-map-caption-line" />
        <span>47 COUNTIES · ONE NATION</span>
        <span className="kenya-map-caption-line" />
      </div>
    </div>
  );
};

export default KenyaCountyMap;
