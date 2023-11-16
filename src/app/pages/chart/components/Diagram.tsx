import * as go from 'gojs';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { GenogramLayout } from '../models/classes';
import { Box } from '@mui/material';
import { IDiagramConfig, IRelative, selectDiagramConfig, selectRelatives, useCustomSelector } from '../../../store';

export function Diagram() {
  const relativesState: IRelative[] = useCustomSelector(selectRelatives);
  const diagramConfigState: IDiagramConfig = useCustomSelector(selectDiagramConfig);
  const [diagram, setDiagram]: [go.Diagram | null, Dispatch<SetStateAction<go.Diagram | null>>] = useState<go.Diagram | null>(null);
  
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
          routing: go.Link.Orthogonal, 
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

    // нужно, чтобы gojs смог добавить свои атрибуты
    const data: IRelative[] = relativesState.map((relative: IRelative) => Object.assign({
      relationship: "Шурин"
    }, relative));
    setupDiagram(diagram, data, 6);

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
          $(go.Shape, diagramConfigState.male.figureType, { 
            width: diagramConfigState.figureSize, 
            height: diagramConfigState.figureSize, 
            strokeWidth: 2, 
            fill: diagramConfigState.male.figureBackgroundColor, 
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
              name: "LASTNAME PANEL",
              type: go.Panel.Horizontal,
            },
              $(go.TextBlock, { 
                textAlign: "center", 
                stroke: diagramConfigState.label.textColor,
                font: "Bold 13px sans-serif",
                text: "Фамилия: ",
                margin: new go.Margin(0, 3, 0, 0)
              }),
              $(go.TextBlock, { 
                textAlign: "center",
                stroke: diagramConfigState.label.textColor
              },
              new go.Binding("text", "lastName", (name: string) => name)),
            ),
            $(go.Panel, { 
              name: "NAME PANEL",
              type: go.Panel.Horizontal,
            },
              $(go.TextBlock, { 
                textAlign: "center", 
                stroke: diagramConfigState.label.textColor,
                font: "Bold 13px sans-serif",
                text: "Имя: ",
                margin: new go.Margin(0, 3, 0, 0)
              }),
              $(go.TextBlock, { 
                textAlign: "center", 
                maxSize: new go.Size(120, NaN),
                stroke: diagramConfigState.label.textColor,
              },
              new go.Binding("text", "name", (name: string) => name)),
            ),
            $(go.Panel, { 
              name: "MIDDLENAME PANEL",
              type: go.Panel.Horizontal,
            },
              $(go.TextBlock, { 
                textAlign: "center", 
                stroke: diagramConfigState.label.textColor,
                font: "Bold 13px sans-serif",
                text: "Отчество: ",
                margin: new go.Margin(0, 3, 0, 0)
              }),
              $(go.TextBlock, {
                textAlign: "center",
                stroke: diagramConfigState.label.textColor
              },
              new go.Binding("text", "middleName", (name: string) => name)),
            ),
            $(go.TextBlock, { 
              textAlign: "center", 
              font: "Italic 13px sans-serif",
              stroke: diagramConfigState.label.textColor
            },
            new go.Binding("text", "relationship"))
          )
        ))
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
          $(go.Shape, diagramConfigState.female.figureType, {
            width: diagramConfigState.figureSize, 
            height: diagramConfigState.figureSize, 
            strokeWidth: 2, 
            fill: diagramConfigState.female.figureBackgroundColor, 
            stroke: diagramConfigState.figureBorderColor, 
            portId: ""
          }),
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
                name: "LASTNAME PANEL",
                type: go.Panel.Horizontal,
              },
                $(go.TextBlock, { 
                  textAlign: "center", 
                  stroke: diagramConfigState.label.textColor,
                  font: "Bold 13px sans-serif",
                  text: "Фамилия: ",
                  margin: new go.Margin(0, 3, 0, 0)
                }),
                $(go.TextBlock, { 
                  textAlign: "center",
                  stroke: diagramConfigState.label.textColor
                },
                new go.Binding("text", "lastName", (name: string) => name)),
              ),
              $(go.Panel, { 
                name: "NAME PANEL",
                type: go.Panel.Horizontal,
              },
                $(go.TextBlock, { 
                  textAlign: "center", 
                  stroke: diagramConfigState.label.textColor,
                  font: "Bold 13px sans-serif",
                  text: "Имя: ",
                  margin: new go.Margin(0, 3, 0, 0)
                }),
                $(go.TextBlock, { 
                  textAlign: "center", 
                  maxSize: new go.Size(120, NaN),
                  stroke: diagramConfigState.label.textColor,
                },
                new go.Binding("text", "name", (name: string) => name)),
              ),
              $(go.Panel, { 
                name: "MIDDLENAME PANEL",
                type: go.Panel.Horizontal,
              },
                $(go.TextBlock, { 
                  textAlign: "center", 
                  stroke: diagramConfigState.label.textColor,
                  font: "Bold 13px sans-serif",
                  text: "Отчество: ",
                  margin: new go.Margin(0, 3, 0, 0)
                }),
                $(go.TextBlock, {
                  textAlign: "center",
                  stroke: diagramConfigState.label.textColor
                },
                new go.Binding("text", "middleName", (name: string) => name)),
              ),
              $(go.TextBlock, { 
                textAlign: "center", 
                font: "Italic 13px sans-serif",
                stroke: diagramConfigState.label.textColor
              },
              new go.Binding("text", "relationship"))
            )
          ),
        )
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

  const setupDiagram: (diagram: go.Diagram, data: IRelative[], focusId: number) => void = (diagram: go.Diagram, data: IRelative[], focusId: number) => {
    diagram.model = new go.GraphLinksModel({
      linkLabelKeysProperty: "labelKeys",
      nodeCategoryProperty: "gender",
      copiesArrays: true,
      nodeDataArray: data
    });
    setupMarriages(diagram);
    setupParents(diagram);

    const node: go.Node | null = diagram.findNodeForKey(focusId);

    if (node) { 
      node.isSelected = true; 
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
    const nodeDataArray: IRelative[] = model.nodeDataArray as IRelative[];
    for (let i = 0; i < nodeDataArray.length; i++) {
      const relative: IRelative = nodeDataArray[i];
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
    const nodeDataArray: IRelative[] = model.nodeDataArray as IRelative[];
    for (let i = 0; i < nodeDataArray.length; i++) {
      const relative: IRelative = nodeDataArray[i];
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
