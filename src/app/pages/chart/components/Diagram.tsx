import * as go from 'gojs';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { GenogramLayout } from '../models/classes';
import { IDiagramConfig, IRelative, selectDiagramConfig, useCustomSelector } from '../../../store';
import { RelationshipService } from '../services';
import { IRelativeNode } from '../models/interfaces';
import { RelativeInfoModal } from './RelativeInfoModal';

type Props = {
  selectedKey: number | null
}

export function Diagram({ selectedKey }: Props) {
  const relationshipService: RelationshipService = new RelationshipService();
  const diagramConfigState: IDiagramConfig = useCustomSelector(selectDiagramConfig);
  // TODO: можно ли в хук вынести?
  const [diagram, setDiagram]: [go.Diagram | null, Dispatch<SetStateAction<go.Diagram | null>>] = useState<go.Diagram | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false);
  const [clickedRelative, setClickedRelative]: [IRelative | null, Dispatch<SetStateAction<IRelative | null>>] = useState<IRelative | null>(null);
  
  
  const closeInfoModal: () => void = () => {
    setIsInfoModalOpen(false);
  }

  const init: () => void = () => {
    const $ = go.GraphObject.make;

    if (diagram) {
      diagram.div = null;
    }

    const genogram = new go.Diagram("genogram", {
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
          fill: diagramConfigState.selectedNodeColor, 
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
          routing: go.Link.Auto, 
          corner: 10, 
          curviness: 15, 
          layerName: "Background", 
          selectable: false 
        },
        $(go.Shape, { 
          stroke: diagramConfigState.linkColor, 
          strokeWidth: 2
        }))
    });

    const nodes: IRelativeNode[] = relationshipService.getRelativesForDiagram(selectedKey);
    setupDiagram(genogram, nodes);
    setDiagram(genogram);
  }

  const showRelativeInfo = (key: number) => {
    const relative: IRelative = relationshipService.findRelativeByKey(key);
    setClickedRelative(relative);
    setIsInfoModalOpen(true);
  }

  const getTemplateItem: (genderKey: 'male' | 'female') => go.Node = (genderKey: 'male' | 'female') => {
    const $ = go.GraphObject.make;

    return $(go.Node, "Vertical", { 
      locationSpot: go.Spot.Center, 
      locationObjectName: "ICON",
      selectionObjectName: "ICON",
      click: (event: go.InputEvent, node: go.GraphObject) => showRelativeInfo(node.part?.key as number)
    },
      new go.Binding("opacity", "hide", hide => hide ? 0 : 1),
      new go.Binding("pickable", "hide", hide => !hide),
      $(go.Panel, { 
        name: "ICON" 
      },
        $(go.Shape, diagramConfigState[genderKey].figureType, { 
          width: diagramConfigState.figureSize, 
          height: diagramConfigState.figureSize, 
          strokeWidth: 2, 
          fill: diagramConfigState[genderKey].figureBackgroundColor, 
          stroke: diagramConfigState.figureBorderColor, 
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
          fill: diagramConfigState.label.backgroundColor, 
          strokeWidth: 1,
          stroke: diagramConfigState.label.borderColor
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
              stroke: diagramConfigState.label.textColor
            },
            new go.Binding("text", "initials", (name: string) => name)),
            $(go.TextBlock, { 
              textAlign: "center", 
              stroke: diagramConfigState.label.textColor,
              font: "Bold 13px sans-serif",
              margin: new go.Margin(0, 0, 0, 3)
            },
            new go.Binding("text", "key", (key: number) => ` (ID: ${key})`)),
          ), selectedKey
            ? $(go.TextBlock, { 
                textAlign: "center", 
                font: "Italic 13px sans-serif",
                stroke: diagramConfigState.label.textColor
              },
              new go.Binding("text", "relationship"))
            : {}
        )
      ))
    )
  }

  const getNodeTemplateMap: () => go.Map<string, go.Node> = () => {
    const $ = go.GraphObject.make;
    const result: go.Map<string, go.Node> = new go.Map<string, go.Node>();
    
    // Мужчины
    result.add("M", getTemplateItem('male'));
    // Женщины
    result.add("F", getTemplateItem('female'));
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
          stroke: diagramConfigState.mariageLinkColor 
        })
      ));
    return result;
  }

  const setupDiagram: (diagram: go.Diagram, data: IRelativeNode[]) => void = (diagram: go.Diagram, data: IRelativeNode[]) => {
    diagram.model = new go.GraphLinksModel({
      linkLabelKeysProperty: "labelKeys",
      nodeCategoryProperty: "gender",
      copiesArrays: true,
      nodeDataArray: data
    });
    setupMarriages(diagram);
    setupParents(diagram);

    if (selectedKey) {
      const node: go.Node | null = diagram.findNodeForKey(selectedKey);

      if (node) { 
        // TODO: как-то заселектить ноду и отцентрироваться по ней
        node.isSelected = true; 
        diagram.select(node);
      }
    }
  }

  const findMarriage: (diagram: go.Diagram, key1: number, key2: number) => go.Link | null = (diagram: go.Diagram, key1: number, key2: number) => {
    const nodeA: go.Node | null = diagram.findNodeForKey(key1);
    const nodeB: go.Node | null = diagram.findNodeForKey(key2);
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

  const setupMarriages: (diagram: go.Diagram) => void = (diagram: go.Diagram) => {
    const model: go.Model = diagram.model;
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
          const link: go.Link | null = findMarriage(diagram, key, wifeKey);
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
          const link: go.Link | null = findMarriage(diagram, key, husbandKey);
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

  const setupParents: (diagram: go.Diagram) => void = (diagram: go.Diagram) => {
    const model: go.Model = diagram.model;
    const nodeDataArray: IRelativeNode[] = model.nodeDataArray as IRelativeNode[];
    for (let i = 0; i < nodeDataArray.length; i++) {
      const relative: IRelativeNode = nodeDataArray[i];
      const key: number = relative.key;
      const motherKey: number | undefined = relative.motherKey;
      const fatherKey: number | undefined = relative.fatherKey;
      if (motherKey !== undefined && fatherKey !== undefined) {
        const link: go.Link | null = findMarriage(diagram, motherKey, fatherKey);
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

  useEffect(() => {
    init();
  }, [selectedKey]);

  return (
    <>
      <Box 
        component="div" 
        id="genogram" 
        sx={{
          bgcolor: "#fff0",
          width: "100%", 
          height: "100%"
        }}>  
      </Box>

      {isInfoModalOpen && <RelativeInfoModal relative={clickedRelative as IRelative} isOpen={isInfoModalOpen} onClose={closeInfoModal}></RelativeInfoModal>}
    </>
  );
}
