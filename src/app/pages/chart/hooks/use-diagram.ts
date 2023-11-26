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
  initLayout: (initialRelationshipVisible: boolean) => void,
  setModel: (nodes: IRelativeNode[], currentRelativeKey: number | null) => void,
  hasDiagramInit: () => boolean,
  focusOnNode: (key: number) => void
} = (
  className: string,
  diagramConfig: IDiagramConfig,
  onNodeClick: (key: number) => void
) => {
  const diagram: MutableRefObject<go.Diagram | null> = useRef<go.Diagram | null>(null);
  const config: MutableRefObject<IDiagramConfig> = useRef<IDiagramConfig>(diagramConfig);

  const initLayout: (initialRelationshipVisible: boolean) => void = (initialRelationshipVisible: boolean) => {
    const $ = go.GraphObject.make;

    if (diagram.current) {
      diagram.current.div = null;
    }

    const genogram: go.Diagram = new go.Diagram(className, {
      "animationManager.isEnabled": false,
      scrollMode: go.Diagram.Uniform,
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
      nodeTemplateMap: getNodeTemplateMap(initialRelationshipVisible),
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
  }

  const getTemplateItem: (
    genderKey: 'male' | 'female',
    initialRelationshipVisible: boolean
  ) => go.Node = 
    (
      genderKey: 'male' | 'female',
      initialRelationshipVisible: boolean
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
            name: "LABEL PANEL",
            type: go.Panel.Vertical,
          },
            $(go.TextBlock, { 
              textAlign: "center", 
              stroke: config.current.label.textColor,
              font: "Bold 13px sans-serif",
              margin: new go.Margin(0, 0, 3, 0)
            },
            new go.Binding("text", "key", (key: number) => ` (ID: ${key})`)),
            $(go.TextBlock, { 
              textAlign: "center",
              stroke: config.current.label.textColor,
              margin: new go.Margin(0, 0, 3, 0)
            },
            new go.Binding("text", "name", (name: string) => name)),
            $(go.TextBlock, { 
              textAlign: "center",
              stroke: config.current.label.textColor
            },
            new go.Binding("text", "lastName", (name: string) => name)),
          ),
            $(go.TextBlock, { 
                textAlign: "center", 
                font: "Italic 13px sans-serif",
                stroke: config.current.label.textColor,
                margin: new go.Margin(3, 0, 0, 0),
                visible: initialRelationshipVisible
              },
              new go.Binding("text", "relationship"),
              new go.Binding("visible", "relationship", (relationship: string | undefined) => !!relationship)
            ),
        )
      ))
    )
  }

  const getNodeTemplateMap: (initialRelationshipVisible: boolean) => go.Map<string, go.Node> = (initialRelationshipVisible: boolean) => {
    const $ = go.GraphObject.make;
    const result: go.Map<string, go.Node> = new go.Map<string, go.Node>();
    
    // Мужчины
    result.add("M", getTemplateItem('male', initialRelationshipVisible));
    // Женщины
    result.add("F", getTemplateItem('female', initialRelationshipVisible));
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
      focusOnNode(currentRelativeKey);
    }
  }

  const focusOnNode: (key: number) => void = (key: number) => {
    const node: go.Node | null = (<go.Diagram>diagram.current).findNodeForKey(key);

    if (node) { 
      node.isSelected = true; 
      // Костыль для получения `node.actualBounds`
      setTimeout(() => {
        (diagram.current as go.Diagram).select(node);
        (diagram.current as go.Diagram).centerRect(node.actualBounds);
      }, 0);
      
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

  const hasDiagramInit: () => boolean = () => {
    return !!diagram.current;
  }

  return { 
    initLayout, 
    setModel, 
    hasDiagramInit,
    focusOnNode
  };
}