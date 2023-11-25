import * as go from 'gojs';
import { MutableRefObject, useRef } from 'react';
import { IDiagramConfig } from '../../../store';
import { GenogramLayout } from '../models/classes';
import { IRelativeNode } from '../models/interfaces';

export const useDiagram: (
  className: string,
  diagramConfig: IDiagramConfig,
  onNodeClick: (key: number) => void
) => {
  draw: (nodes: IRelativeNode[], currentRelativeKey: number | null) => void
} = (
  className: string,
  diagramConfig: IDiagramConfig,
  onNodeClick: (key: number) => void
) => {
  const diagram: MutableRefObject<go.Diagram | null> = useRef<go.Diagram | null>(null);
  const config: MutableRefObject<IDiagramConfig> = useRef<IDiagramConfig>(diagramConfig);

  const draw: (nodes: IRelativeNode[], currentRelativeKey: number | null) => void = 
    (nodes: IRelativeNode[], currentRelativeKey: number | null) => {
    const $ = go.GraphObject.make;

    if (diagram.current) {
      diagram.current.div = null;
    }

    const genogram: go.Diagram = new go.Diagram(className, {
      "animationManager.isEnabled": false,
      // автомасштабирование, чтобы все узлы влезли на экран
      // initialAutoScale: go.Diagram.Uniform,
      "undoManager.isEnabled": true,
      maxSelectionCount: 1,
      // когда узел выбран, рисуем за ним большой желтый круг
      nodeSelectionAdornmentTemplate:
        $(go.Adornment, "Auto", {
          layerName: "Grid" 
        },  
        $(go.Shape, "Circle", { 
          fill: config.current.selectedNodeColor, 
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
      nodeTemplateMap: getNodeTemplateMap(currentRelativeKey),
      linkTemplateMap: getLinkTemplateMap(),
      linkTemplate: 
        $(go.Link, { 
          routing: go.Link.Auto, 
          corner: 10, 
          curviness: 15, 
          layerName: "Background", 
          selectable: false 
        },
        $(go.Shape, { 
          stroke: config.current.linkColor, 
          strokeWidth: 2
        }))
    });

    diagram.current = genogram;
    setModel(nodes, currentRelativeKey);
  }

  const getTemplateItem: (
    genderKey: 'male' | 'female',
    currentRelativeKey: number | null
  ) => go.Node = 
    (
      genderKey: 'male' | 'female',
      currentRelativeKey: number | null
    ) => {
    const $ = go.GraphObject.make;

    return $(go.Node, "Vertical", { 
      locationSpot: go.Spot.Center, 
      locationObjectName: "ICON",
      selectionObjectName: "ICON",
      click: (_: go.InputEvent, node: go.GraphObject) => onNodeClick(node.part?.key as number)
    },
      new go.Binding("opacity", "hide", hide => hide ? 0 : 1),
      new go.Binding("pickable", "hide", hide => !hide),
      $(go.Panel, { 
        name: "ICON" 
      },
        $(go.Shape, config.current[genderKey].figureType, { 
          width: config.current.figureSize, 
          height: config.current.figureSize, 
          strokeWidth: 2, 
          fill: config.current[genderKey].figureBackgroundColor, 
          stroke: config.current.figureBorderColor, 
          portId: "" 
        })
      ),
      $(go.Panel, { 
        name: "INFO",
        type: go.Panel.Vertical,
        margin: new go.Margin(5, 0, 0, 0),
      },
      $(go.Panel, "Auto", {},
        $(go.Shape, { 
          fill: config.current.label.backgroundColor, 
          strokeWidth: 1,
          stroke: config.current.label.borderColor
        }),
        $(go.Panel, { 
          name: "INFO",
          type: go.Panel.Vertical,
          padding: new go.Margin(5, 10, 5, 10),
        },
          $(go.Panel, { 
            name: "INITIALS PANEL",
            type: go.Panel.Horizontal,
          },
            $(go.TextBlock, { 
              textAlign: "center",
              stroke: config.current.label.textColor
            },
            new go.Binding("text", "initials", (name: string) => name)),
            $(go.TextBlock, { 
              textAlign: "center", 
              stroke: config.current.label.textColor,
              font: "Bold 13px sans-serif",
              margin: new go.Margin(0, 0, 0, 3)
            },
            new go.Binding("text", "key", (key: number) => ` (ID: ${key})`)),
          ), currentRelativeKey
            ? $(go.TextBlock, { 
                textAlign: "center", 
                font: "Italic 13px sans-serif",
                stroke: config.current.label.textColor
              },
              new go.Binding("text", "relationship"))
            : {}
        )
      ))
    )
  }

  const getNodeTemplateMap: (currentRelativeKey: number | null) => go.Map<string, go.Node> = (currentRelativeKey: number | null) => {
    const $ = go.GraphObject.make;
    const result: go.Map<string, go.Node> = new go.Map<string, go.Node>();
    
    // Мужчины
    result.add("M", getTemplateItem('male', currentRelativeKey));
    // Женщины
    result.add("F", getTemplateItem('female', currentRelativeKey));
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
    result.add("Marriage",
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
          stroke: config.current.mariageLinkColor 
        })
      ));

    return result;
  }

  const setModel: (nodes: IRelativeNode[], currentRelativeKey: number | null) => void = 
    (nodes: IRelativeNode[], currentRelativeKey: number | null) => {
    (<go.Diagram>diagram.current).model = new go.GraphLinksModel({
      linkLabelKeysProperty: "labelKeys",
      nodeCategoryProperty: "gender",
      copiesArrays: true,
      nodeDataArray: nodes
    });
    setupMarriages();
    setupParents();

    if (currentRelativeKey) {
      const node: go.Node | null = (<go.Diagram>diagram.current).findNodeForKey(currentRelativeKey);

      if (node) { 
        // TODO: как-то заселектить ноду и отцентрироваться по ней
        node.isSelected = true; 
        (<go.Diagram>diagram.current).select(node);
      }
    }
  }

  const findMarriage: (key1: number, key2: number) => go.Link | null = (key1: number, key2: number) => {
    const nodeA: go.Node | null = (<go.Diagram>diagram.current).findNodeForKey(key1);
    const nodeB: go.Node | null = (<go.Diagram>diagram.current).findNodeForKey(key2);
    if (nodeA && nodeB) {
      const it: go.Iterator<go.Link> = nodeA.findLinksBetween(nodeB);
      while (it.next()) {
        const link: go.Link = it.value;

        if (link.data && link.data.category === "Marriage") { 
          return link; 
        }
      }
    }

    return null;
  }

  const setupMarriages: () => void = () => {
    const model: go.Model = (<go.Diagram>diagram.current).model;
    const nodeDataArray: IRelativeNode[] = model.nodeDataArray as IRelativeNode[];
    for (let i = 0; i < nodeDataArray.length; i++) {
      const relative: IRelativeNode = nodeDataArray[i];
      const key: number = relative.key;
      const wifeKeys: number[] | undefined = relative.wifeKeys;
      
      if (wifeKeys) {
        for (let j = 0; j < wifeKeys.length; j++) {
          const wifeKey: number = wifeKeys[j];
          const wifeData: go.ObjectData | null = model.findNodeDataForKey(wifeKey);
          if (key === wifeKey || !wifeData || wifeData.gender !== "F") {
            console.log(`Невозможно создать брачные отношения с самим собой или с неизвестным человеком (идентификатор: ${wifeKey})`);
            continue;
          }
          const link: go.Link | null = findMarriage(key, wifeKey);
          if (!link) {
            const mariageLabel: go.ObjectData = { gender: "LinkLabel" };
            model.addNodeData(mariageLabel);
            const mariageData: go.ObjectData = { 
              from: key, 
              to: wifeKey, 
              labelKeys: [mariageLabel.key], 
              category: "Marriage" 
            };
            (model as go.Model & { addLinkData: (data: go.ObjectData) => void }).addLinkData(mariageData);
          }
        }
      }
      const husbandKeys: number[] | undefined = relative.husbandKeys;
      if (husbandKeys) {
        for (let j = 0; j < husbandKeys.length; j++) {
          const husbandKey: number = husbandKeys[j];
          const husbandData: go.ObjectData | null = model.findNodeDataForKey(husbandKey);
          if (key === husbandKey || !husbandData || husbandData.gender !== "M") {
            console.log(`Невозможно создать брачные отношения с самим собой или с неизвестным человеком (идентификатор: ${husbandKey})`);
            continue;
          }
          const link: go.Link | null = findMarriage(key, husbandKey);
          if (!link) {
            const mariageLabel: go.ObjectData = { gender: "LinkLabel" };
            model.addNodeData(mariageLabel);
            const mariageData: go.ObjectData = { 
              from: key, 
              to: husbandKey, 
              labelKeys: [mariageLabel.key], 
              category: "Marriage" 
            };
            (model as go.Model & { addLinkData: (data: go.ObjectData) => void }).addLinkData(mariageData);
          }
        }
      }
    }
  }

  const setupParents: () => void = () => {
    const model: go.Model = (<go.Diagram>diagram.current).model;
    const nodeDataArray: IRelativeNode[] = model.nodeDataArray as IRelativeNode[];
    for (let i = 0; i < nodeDataArray.length; i++) {
      const relative: IRelativeNode = nodeDataArray[i];
      const key: number = relative.key;
      const motherKey: number | undefined = relative.motherKey;
      const fatherKey: number | undefined = relative.fatherKey;
      if (motherKey !== undefined && fatherKey !== undefined) {
        const link: go.Link | null = findMarriage(motherKey, fatherKey);
        if (!link) {
          console.log(`Неизвестный брак: идентфикатор матери - ${motherKey}, идентификатор отца - ${fatherKey}`);
          continue;
        }
        const mariageData: { labelKeys: number[] } = link.data;
        if (!mariageData.labelKeys || mariageData.labelKeys[0] === undefined) { 
          continue; 
        }
        const mariageLabelKey: number = mariageData.labelKeys[0];
        const cdata: object = { 
          from: mariageLabelKey, 
          to: key 
        };
        (model as go.Model & { addLinkData: (data: go.ObjectData) => void }).addLinkData(cdata);
      }
    }
  }

  return { draw };
}