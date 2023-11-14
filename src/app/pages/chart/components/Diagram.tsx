import * as go from 'gojs';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { GenogramLayout } from '../models/classes';
import { Box } from '@mui/material';

export function Diagram() {
  const [diagram, setDiagram]: [go.Diagram | null, Dispatch<SetStateAction<go.Diagram| null>>] = useState<go.Diagram | null>(null)
  
  const initDiagram: () => void = () => {
    const $ = go.GraphObject.make;

    const diagram = new go.Diagram("genogram", {
      "animationManager.isEnabled": false,
      initialAutoScale: go.Diagram.Uniform,
      "undoManager.isEnabled": true,
      maxSelectionCount: 1,
      // когда узел выбран, рисуем за ним большой желтый круг
      nodeSelectionAdornmentTemplate:
        $(go.Adornment, "Auto", {
          // предопределенный слой, который находится за всем остальным
          layerName: "Grid" 
        },  
        $(go.Shape, "Circle", { 
          fill: "#f3fc90", 
          stroke: null 
        }),
        $(go.Placeholder, { 
          margin: 2 
        })),
      layout: 
        $(GenogramLayout, { 
          direction: 90, 
          layerSpacing: 30, 
          columnSpacing: 10 
        }),
      nodeTemplateMap: getNodeTemplateMap(),
      linkTemplateMap: getLinkTemplateMap(),
      linkTemplate: 
        $(go.Link, { 
          routing: go.Link.Orthogonal, 
          corner: 10, 
          curviness: 15, 
          layerName: "Background", 
          selectable: false 
        },
        $(go.Shape, { 
          stroke: "#696969", 
          strokeWidth: 2 
        }))
    });
    // n: name, s: sex, m: mother, f: father, ux: wife, vir: husband, a: attributes/markers

    setupDiagram(diagram, [
      { key: 0, n: "Aaron", s: "M", m: -10, f: -11, ux: 1 },
      { key: 1, n: "Alice", s: "F", m: -12, f: -13 },
      { key: 2, n: "Bob", s: "M", m: 1, f: 0, ux: 3 },
      { key: 3, n: "Barbara", s: "F" },
      { key: 4, n: "Bill", s: "M", m: 1, f: 0, ux: 5 },
      { key: 5, n: "Brooke", s: "F" },
      { key: 6, n: "Claire", s: "F", m: 1, f: 0 },
      { key: 7, n: "Carol", s: "F", m: 1, f: 0 },
      { key: 8, n: "Chloe", s: "F", m: 1, f: 0, vir: 9 },
      { key: 9, n: "Chris", s: "M" },
      { key: 10, n: "Ellie", s: "F", m: 3, f: 2 },
      { key: 11, n: "Dan", s: "M", m: 3, f: 2 },
      { key: 12, n: "Elizabeth", s: "F", vir: 13 },
      { key: 13, n: "David", s: "M", m: 5, f: 4 },
      { key: 14, n: "Emma", s: "F", m: 5, f: 4 },
      { key: 15, n: "Evan", s: "M", m: 8, f: 9 },
      { key: 16, n: "Ethan", s: "M", m: 8, f: 9 },
      { key: 17, n: "Eve", s: "F", vir: 16 },
      { key: 18, n: "Emily", s: "F", m: 8, f: 9 },
      { key: 19, n: "Fred", s: "M", m: 17, f: 16 },
      { key: 20, n: "Faith", s: "F", m: 17, f: 16 },
      { key: 21, n: "Felicia", s: "F", m: 12, f: 13 },
      { key: 22, n: "Frank", s: "M", m: 12, f: 13 },

      // "Aaron"'s ancestors
      { key: -10, n: "Paternal Grandfather", s: "M", m: -33, f: -32, ux: -11 },
      { key: -11, n: "Paternal Grandmother", s: "F" },
      { key: -32, n: "Paternal Great", s: "M", ux: -33 },
      { key: -33, n: "Paternal Great", s: "F" },
      { key: -40, n: "Great Uncle", s: "M", m: -33, f: -32 },
      { key: -41, n: "Great Aunt", s: "F", m: -33, f: -32 },
      { key: -20, n: "Uncle", s: "M", m: -11, f: -10 },

      // "Alice"'s ancestors
      { key: -12, n: "Maternal Grandfather", s: "M", ux: -13 },
      { key: -13, n: "Maternal Grandmother", s: "F", m: -31, f: -30 },
      { key: -21, n: "Aunt", s: "F", m: -13, f: -12 },
      { key: -22, n: "Uncle", s: "M", ux: -21 },
      { key: -23, n: "Cousin", s: "M", m: -21, f: -22 },
      { key: -30, n: "Maternal Great", s: "M", ux: -31 },
      { key: -31, n: "Maternal Great", s: "F", m: -50, f: -51 },
      { key: -42, n: "Great Uncle", s: "M", m: -30, f: -31 },
      { key: -43, n: "Great Aunt", s: "F", m: -30, f: -31 },
      { key: -50, n: "Maternal Great Great", s: "F", vir: -51 },
      { key: -51, n: "Maternal Great Great", s: "M" }
    ], 4);

    setDiagram(diagram);
  }

  const getNodeTemplateMap: () => go.Map<string, go.Node> = () => {
    const $ = go.GraphObject.make;
    const result: go.Map<string, go.Node> = new go.Map<string, go.Node>();
    
    // Мужчины
    result.add("M",
      $(go.Node, "Vertical", { 
        locationSpot: go.Spot.Center, 
        locationObjectName: "ICON",
        selectionObjectName: "ICON" 
      },
        new go.Binding("opacity", "hide", hide => hide ? 0 : 1),
        new go.Binding("pickable", "hide", hide => !hide),
        $(go.Panel, { 
          name: "ICON" 
        },
          $(go.Shape, "Square", { 
            width: 40, 
            height: 40, 
            strokeWidth: 2, 
            fill: "#b9d2fa", 
            stroke: "#696969", 
            portId: "" 
          })
        ),
        $(go.TextBlock, { 
          textAlign: "center", 
          maxSize: new go.Size(80, NaN), 
          background: "red" 
        },
        new go.Binding("text", "n", (data) => "haha" + data))
      ));

    // Женщины
    result.add("F",
      $(go.Node, "Vertical", { 
          locationSpot: go.Spot.Center, 
          locationObjectName: "ICON",
          selectionObjectName: "ICON" 
        },
        new go.Binding("opacity", "hide", hide => hide ? 0 : 1),
        new go.Binding("pickable", "hide", hide => !hide),
        $(go.Panel, { 
          name: "ICON" 
        },
          $(go.Shape, "Circle", {
            width: 40, 
            height: 40, 
            strokeWidth: 2, 
            fill: "#faafd9", 
            stroke: "#696969", 
            portId: "" 
          }),
        ),
        $(go.TextBlock, { 
          textAlign: "center", 
          maxSize: new go.Size(80, NaN), 
          background: "blue" 
        },
        new go.Binding("text", "n"))
      ));

    // чтобы ничего не отображалось на ссылке для "брака"
    result.add("LinkLabel",
      $(go.Node, { 
        selectable: false,
        width: 1, 
        height: 1, 
        fromEndSegmentLength: 20 
      }));

    return result;
  }

  const getLinkTemplateMap: () => go.Map<string, go.Link> = () => {
    const $ = go.GraphObject.make;
    const result: go.Map<string, go.Link> = new go.Map<string, go.Link>();
    result.add("Marriage", // ссылка на "брак"
      $(go.Link, { 
        routing: go.Link.AvoidsNodes, 
        corner: 10,
        fromSpot: go.Spot.LeftRightSides, 
        toSpot: go.Spot.LeftRightSides,
        selectable: false, 
        isTreeLink: false, 
        layerName: "Background" 
      },
        $(go.Shape, { 
          strokeWidth: 3.5, 
          stroke: "black" 
        })
      ));
    return result;
  }

  const setupDiagram: (diagram: go.Diagram, array: object[], focusId: number) => void = (diagram: go.Diagram, array: object[], focusId: number) => {
    diagram.model = new go.GraphLinksModel({
      linkLabelKeysProperty: "labelKeys",
      nodeCategoryProperty: "s",
      copiesArrays: true,
      nodeDataArray: array
    });
    setupMarriages(diagram);
    setupParents(diagram);

    const node: go.Node | null = diagram.findNodeForKey(focusId);

    if (node !== null) { 
      node.isSelected = true; 
    }
  }

  const findMarriage: (diagram: go.Diagram, key1: number, key2: number) => go.Link | null = (diagram: go.Diagram, key1: number, key2: number) => {
    const nodeA: go.Node | null = diagram.findNodeForKey(key1);
    const nodeB: go.Node | null = diagram.findNodeForKey(key2);
    if (nodeA !== null && nodeB !== null) {
      const it: go.Iterator<go.Link> = nodeA.findLinksBetween(nodeB);
      while (it.next()) {
        const link: go.Link = it.value;
        // если между узлами заключен брак
        if (link.data !== null && link.data.category === "Marriage") { return link; }
      }
    }

    return null;
  }

  const setupMarriages: (diagram: go.Diagram) => void = (diagram: go.Diagram) => {
    const model: go.Model = diagram.model;
    const nodeDataArray: go.ObjectData[] = model.nodeDataArray;
    for (let i = 0; i < nodeDataArray.length; i++) {
      const data: go.ObjectData = nodeDataArray[i];
      const key: number = data.key;
      let uxs: number[] | number | undefined = data.ux;
      if (uxs !== undefined) {
        if (typeof uxs === "number") { 
          uxs = [uxs]; 
        }
        for (let j = 0; j < uxs.length; j++) {
          const wife: number = uxs[j];
          const wdata: go.ObjectData | null = model.findNodeDataForKey(wife);
          if (key === wife || !wdata || wdata.s !== "F") {
            console.log("cannot create Marriage relationship with self or unknown person " + wife);
            continue;
          }
          const link: go.Link | null = findMarriage(diagram, key, wife);
          if (link === null) {
            const mlab: go.ObjectData = { s: "LinkLabel" };
            model.addNodeData(mlab);
            const mdata: object = { 
              from: key, 
              to: wife, 
              labelKeys: [mlab.key], 
              category: "Marriage" 
            };
            (model as go.Model & { addLinkData: (data: go.ObjectData) => void }).addLinkData(mdata);
          }
        }
      }
      let virs: number[] | number | undefined = data.vir;
      if (virs !== undefined) {
        if (typeof virs === "number") { 
          virs = [virs]; 
        }
        for (let j = 0; j < virs.length; j++) {
          const husband: number = virs[j];
          const hdata: go.ObjectData | null = model.findNodeDataForKey(husband);
          if (key === husband || !hdata || hdata.s !== "M") {
            console.log("cannot create Marriage relationship with self or unknown person " + husband);
            continue;
          }
          const link: go.Link | null = findMarriage(diagram, key, husband);
          if (link === null) {
            const mlab: go.ObjectData = { s: "LinkLabel" };
            model.addNodeData(mlab);
            const mdata: object = { 
              from: key, 
              to: husband, 
              labelKeys: 
              [mlab.key], 
              category: "Marriage" 
            };
            (model as go.Model & { addLinkData: (data: go.ObjectData) => void }).addLinkData(mdata);
          }
        }
      }
    }
  }

  const setupParents: (diagram: go.Diagram) => void = (diagram: go.Diagram) => {
    const model: go.Model = diagram.model;
    const nodeDataArray: go.ObjectData[] = model.nodeDataArray;
    for (let i = 0; i < nodeDataArray.length; i++) {
      const data: go.ObjectData = nodeDataArray[i];
      const key: number = data.key;
      const mother: number | undefined = data.m;
      const father: number | undefined = data.f;
      if (mother !== undefined && father !== undefined) {
        const link: go.Link | null = findMarriage(diagram, mother, father);
        if (link === null) {
          console.log("unknown marriage: " + mother + " & " + father);
          continue;
        }
        const mdata: { labelKeys: number[] } = link.data;
        if (mdata.labelKeys === undefined || mdata.labelKeys[0] === undefined) { 
          continue; 
        }
        const mlabkey: number = mdata.labelKeys[0];
        const cdata: object = { 
          from: mlabkey, 
          to: key 
        };
        (model as go.Model & { addLinkData: (data: go.ObjectData) => void }).addLinkData(cdata);
      }
    }
  }

  useEffect(() => {
    initDiagram();
  }, [])


  return (
    <Box 
      component="div" 
      id="genogram" 
      sx={{
        bgcolor: "#fff0",
        width: "100%", 
        height: "100%"
      }}>  
    </Box>
  );
}
