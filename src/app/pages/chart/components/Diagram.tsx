import { ReactDiagram } from 'gojs-react';
import * as go from 'gojs';
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import { FONT_FAMILY, NEW_RELATIVE, RELATIVE_NODE_BACKGROUND_COLOR, RELATIVE_NODE_BORDER_COLOR, RELATIVE_NODE_DRAG_BACKGROUND_COLOR, RELATIVE_NODE_TEXT_COLOR } from '../constants';
import { insertNewRelative } from '../utils';

export function Diagram() {
  const diagramRef: MutableRefObject<ReactDiagram | null> = useRef<ReactDiagram | null>(null);
  const [nodeDataArray, setNodeDataArray]: [go.ObjectData[], Dispatch<SetStateAction<go.ObjectData[]>>] = useState<go.ObjectData[]>([]);
  const [linkDataArray, setLinkDataArray]: [go.ObjectData[], Dispatch<SetStateAction<go.ObjectData[]>>] = useState<go.ObjectData[]>([]);
  const [modelData, setModelData]: [go.ObjectData, Dispatch<SetStateAction<go.ObjectData>>] = useState<go.ObjectData>({});
  const [skipsDiagramUpdate, setSkipsDiagramUpdate]: [boolean, Dispatch<SetStateAction<boolean>>] = useState<boolean>(false); 
  const [selectedKey, setSelectedKey]: [null, Dispatch<SetStateAction<null>>] = useState(null); 

  useEffect(() => {
    const currentRef: ReactDiagram | null = diagramRef.current;
    if (!currentRef) return;

    console.warn(123);
    setNodeDataArray([
      {"key":1, "name":"Stella Payne Diaz", "title":"CEO", "pic":"vite.svg"},
      {"key":2, "name":"Luke Warm", "title":"VP Marketing/Sales", "pic":"vite.svg", "parent":1},
      {"key":3, "name":"Meg Meehan Hoffa", "title":"Sales", "pic":"vite.svg", "parent":2},
      {"key":4, "name":"Peggy Flaming", "title":"VP Engineering", "pic":"vite.svg", "parent":1},
      {"key":5, "name":"Saul Wellingood", "title":"Manufacturing", "pic":"vite.svg", "parent":4},
      {"key":6, "name":"Al Ligori", "title":"Marketing", "pic":"vite.svg", "parent":2},
      {"key":7, "name":"Dot Stubadd", "title":"Sales Rep", "pic":"vite.svg", "parent":3},
      {"key":8, "name":"Les Ismore", "title":"Project Mgr", "pic":"vite.svg", "parent":5},
      {"key":9, "name":"April Lynn Parris", "title":"Events Mgr", "pic":"vite.svg", "parent":6},
      {"key":10, "name":"Xavier Breath", "title":"Engineering", "pic":"vite.svg", "parent":4},
      {"key":11, "name":"Anita Hammer", "title":"Process", "pic":"vite.svg", "parent":5},
      {"key":12, "name":"Billy Aiken", "title":"Software", "pic":"vite.svg", "parent":10},
      {"key":13, "name":"Stan Wellback", "title":"Testing", "pic":"vite.svg", "parent":10},
      {"key":14, "name":"Marge Innovera", "title":"Hardware", "pic":"vite.svg", "parent":10},
      {"key":15, "name":"Evan Elpus", "title":"Quality", "pic":"vite.svg", "parent":5},
      {"key":16, "name":"Lotta B. Essen", "title":"Sales Rep", "pic":"vite.svg", "parent":3}
    ]);

    // read in the JSON-format data from the "mySavedModel" element
    load();
  }, []);

  // TODO: нужна ли эта функция, тк у нас не про работу
  const mayWorkFor = (node1: go.Node | null, node2: go.Node | null) => {
    if (!node1 || !node2) {
      return false;     
    }
    if (node1 === node2) return false;
    
    if (node2.isInTreeOf(node1)) return false;
    return true;
  }

  const relativeNodeTextStyle = (size: number) => {
    return { 
      font: `${size}pt ${FONT_FAMILY},sans-serif`, 
      stroke: RELATIVE_NODE_TEXT_COLOR 
    };
  }

  const relativeHover: (opacity: 0 | 1) => (event: go.InputEvent, node: go.GraphObject) => void = (opacity: 0 | 1) => {
    return (event: go.InputEvent, node: go.GraphObject) => {
      const addEmployeeButton: go.GraphObject | null = (node as go.Part).findObject("BUTTON");
      const expandTreeButton: go.GraphObject | null = (node as go.Part).findObject("BUTTONX");
      if (!addEmployeeButton || !expandTreeButton) {
        return;
      }
      addEmployeeButton.opacity = expandTreeButton.opacity = opacity;
    }
  }

  const relativeDragEnter: (event: go.InputEvent, node: go.GraphObject) => void = (event: go.InputEvent, node: go.GraphObject) => {
    const diagram: go.Diagram | null = node.diagram;
    if (!diagram) {
      return;
    }

    const selectedNode: go.Part | null = diagram.selection.first();
    if (!mayWorkFor(selectedNode as go.Node, node as go.Node)) {
      return;
    }

    const shape: go.GraphObject | null = (node as go.Part).findObject("SHAPE");
    if (!shape) {
      return;
    }
    
    (shape as go.Shape).fill = RELATIVE_NODE_DRAG_BACKGROUND_COLOR;
  }

  const relativeDragLeave: (event: go.InputEvent, node: go.GraphObject) => void = (event: go.InputEvent, node: go.GraphObject) => {
    const shape: go.GraphObject | null = (node as go.Part).findObject("SHAPE");
    if (!shape) {
      return;
    }
    
    (shape as go.Shape).fill = RELATIVE_NODE_BACKGROUND_COLOR;
  }
  const relativeDrop: (event: go.InputEvent, node: go.GraphObject) => void = (event: go.InputEvent, node: go.GraphObject) => {
    const diagram: go.Diagram | null = node.diagram;
    if (!diagram) {
      return;
    }

    const selectedNode: go.Part | null = diagram.selection.first();
    if (!mayWorkFor(selectedNode as go.Node, node as go.Node)) {
      return;
    }
    
    const link: go.Link | null = (selectedNode as go.Node).findTreeParentLink();
    if (link === null) {
      diagram.toolManager.linkingTool.insertLink(node as go.Node, (node as go.Node).port, selectedNode as go.Node, (selectedNode as go.Node).port);
    } else { 
      link.fromNode = node as go.Node;
    }
  }

  const getNodeTemplateSettings: () => Partial<go.Node> = () => {
    return {
      selectionObjectName: "BODY",
      mouseEnter: relativeHover(1),
      mouseLeave: relativeHover(0),
      mouseDragEnter: relativeDragEnter,
      mouseDragLeave: relativeDragLeave,
      mouseDrop: relativeDrop
    };
  }

  const getDiagramSettings: () => Partial<go.Diagram> = () => {
    const $ = go.GraphObject.make;
    
    return {
      allowCopy: false,
      allowDelete: false,
      // initialAutoScale: go.Diagram.Uniform,
      maxSelectionCount: 1,
      validCycle: go.Diagram.CycleDestinationTree,
      model: $(go.GraphLinksModel, {
        linkKeyProperty: 'key',
      }),
      // Двойной клик по заднему фону добавляет новые узел
      "clickCreatingTool.archetypeNodeData": NEW_RELATIVE,
      "clickCreatingTool.insertPart": insertNewRelative,
      layout: $(go.TreeLayout, {
        treeStyle: go.TreeLayout.StyleLastParents,
        arrangement: go.TreeLayout.ArrangementHorizontal,
        angle: 90,
        layerSpacing: 35,
        alternateAngle: 90,
        alternateLayerSpacing: 35,
        alternateAlignment: go.TreeLayout.AlignmentBus,
        alternateNodeSpacing: 20,
      }),
      "undoManager.isEnabled": true,
      nodeTemplate: $(go.Node, "Spot", 
        getNodeTemplateSettings(),
        new go.Binding("text", "name"),
        $(go.Panel, "Auto", { 
          name: "BODY" 
        },
        $(go.Shape, "RoundedRectangle", { 
          name: "SHAPE", 
          fill: RELATIVE_NODE_BACKGROUND_COLOR, 
          stroke: RELATIVE_NODE_BORDER_COLOR,
          // Скругление границы
          parameter1: 2,
          strokeWidth: 3, 
          portId: ""
        }),
        $(go.Panel, "Horizontal",
          $(go.Picture, {
            name: "Picture",
            desiredSize: new go.Size(70, 70),
            margin: 1.5,
            // Дефолтное изображение при добавлении узла
            source: "https://placehold.co/70"
          },
          new go.Binding("source", "pic")),
          $(go.Panel, "Table", {
            minSize: new go.Size(130, NaN),
            maxSize: new go.Size(150, NaN),
            margin: new go.Margin(6, 10, 6, 10),
            defaultAlignment: go.Spot.Left
          },
          $(go.RowColumnDefinition, { 
            column: 2,
            // TODO: мб нужно еще кол-во строк
            width: 4
          }),
          $(go.TextBlock, relativeNodeTextStyle(12), {
            name: "NAMETB",
            row: 0, 
            column: 0, 
            columnSpan: 5,
            editable: true, 
            isMultiline: false,
            minSize: new go.Size(50, 16)
          },
          new go.Binding("text", "name").makeTwoWay()),
          $(go.TextBlock, "Title: ", relativeNodeTextStyle(9), { 
            row: 1, 
            column: 0 
          }),
          $(go.TextBlock, relativeNodeTextStyle(9), {
            row: 1, 
            column: 1, 
            columnSpan: 4,
            editable: true, 
            isMultiline: false,
            minSize: new go.Size(50, 14),
            margin: new go.Margin(0, 0, 0, 2)
          },
          new go.Binding("text", "title").makeTwoWay()),
          $(go.TextBlock, relativeNodeTextStyle(9), { 
            row: 2, 
            column: 0 
          },
          new go.Binding("text", "key", (id: number) => "ID: " + id)),
          $(go.TextBlock, relativeNodeTextStyle(9), {
            row: 3, 
            column: 0, 
            columnSpan: 5,
            wrap: go.TextBlock.WrapFit,
            editable: true,
            minSize: new go.Size(100, 14)
          },
          new go.Binding("text", "comments").makeTwoWay())
        ))),
        $("Button",
          $(go.Shape, "PlusLine", { 
            width: 10, 
            height: 10 
          }), {
            name: "BUTTON", 
            alignment: go.Spot.Right, 
            // Изначально не должна быть видна
            opacity: 0,
            click: addEmployee
          },
          // Кнопка видна либо при выборе узла, либо при наведении курсора мыши
          new go.Binding("opacity", "isSelected", op => op ? 1 : 0).ofObject()
        ),
        new go.Binding("isTreeExpanded").makeTwoWay(),
        $("TreeExpanderButton", {
          name: "BUTTONX", 
          alignment: go.Spot.Bottom,
          // Изначально не должна быть видна 
          opacity: 0,
          "_treeExpandedFigure": "TriangleUp",
          "_treeCollapsedFigure": "TriangleDown"
        },
        // Кнопка видна либо при выборе узла, либо при наведении курсора мыши
        new go.Binding("opacity", "isSelected", op => op ? 1 : 0).ofObject()
        )
      )
    }
  }

  const addEmployee: (event: go.InputEvent, node: go.GraphObject) => void = (event: go.InputEvent, node: go.GraphObject) => {
    const button: go.Part | null = (node as go.Node).part;
    if (!button) {
      return;
    }
    const currentEmployee: object & { key: number } = button.data;
    const diagram: go.Diagram | null = button.diagram;
    if (!diagram) {
      return;
    }

    diagram.startTransaction("add employee");
    const newEmployee: object = { name: "(new person)", title: "(title)", comments: "", parent: currentEmployee.key };
    diagram.model.addNodeData(newEmployee);
    const newEmployeeNode: go.Node | null = diagram.findNodeForData(newEmployee);
    if (!newEmployeeNode) {
      return;
    }
    newEmployeeNode.location = button.location;
    diagram.commitTransaction("add employee");
    diagram.commandHandler.scrollToPart(newEmployeeNode);
  }

  const initDiagram: () => go.Diagram = () => {
    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, getDiagramSettings());

    diagram.nodeTemplate.contextMenu =
      $("ContextMenu",
        $("ContextMenuButton",
          $(go.TextBlock, "Add Employee"),
          {
            click: (e, button) => addEmployee((button.part as any).adornedPart)
          }
        ),
        $("ContextMenuButton",
          $(go.TextBlock, "Vacate Position"),
          {
            click: (e, button) => {
              const node = (button.part as any).adornedPart;
              if (node !== null) {
                const thisemp = node.data;
                diagram.startTransaction("vacate");
                // update the key, name, picture, and comments, but leave the title
                diagram.model.setDataProperty(thisemp, "name", "(Vacant)");
                diagram.model.setDataProperty(thisemp, "pic", "");
                diagram.model.setDataProperty(thisemp, "comments", "");
                diagram.commitTransaction("vacate");
              }
            }
          }
        ),
        $("ContextMenuButton",
          $(go.TextBlock, "Remove Role"),
          {
            click: (e, button) => {
              // reparent the subtree to this node's boss, then remove the node
              const node = (button.part as any).adornedPart;
              if (node !== null) {
                diagram.startTransaction("reparent remove");
                const chl = node.findTreeChildrenNodes();
                // iterate through the children and set their parent key to our selected node's parent key
                while (chl.next()) {
                  const emp = chl.value;
                  (diagram.model as any).setParentKeyForNodeData(emp.data, node.findTreeParentNode().data.key);
                }
                // and now remove the selected node itself
                diagram.model.removeNodeData(node.data);
                diagram.commitTransaction("reparent remove");
              }
            }
          }
        ),
        $("ContextMenuButton",
          $(go.TextBlock, "Remove Department"),
          {
            click: (e, button) => {
              // remove the whole subtree, including the node itself
              const node = (button.part as any).adornedPart;
              if (node !== null) {
                diagram.startTransaction("remove dept");
                diagram.removeParts(node.findTreeParts());
                diagram.commitTransaction("remove dept");
              }
            }
          }
        )
      );

    // relinking depends on modelData
    diagram.linkTemplate =
      $(go.Link, go.Link.Orthogonal,
        { layerName: "Background", corner: 5 },
        $(go.Shape, { strokeWidth: 1.5, stroke: "red" }));  // the link shape

    return diagram;
  }
  
  const load = () => {
    const currentRef: ReactDiagram | null = diagramRef.current;
    const diagram = currentRef?.getDiagram() as go.Diagram;
    console.warn('test');
    diagram.model = go.Model.fromJson(
      { "class": "go.TreeModel",
        "nodeDataArray": [
        {"key":1, "name":"Stella Payne Diaz", "title":"CEO", "pic":"vite.svg"},
        {"key":2, "name":"Luke Warm", "title":"VP Marketing/Sales", "pic":"vite.svg", "parent":1},
        {"key":3, "name":"Meg Meehan Hoffa", "title":"Sales", "pic":"vite.svg", "parent":2},
        {"key":4, "name":"Peggy Flaming", "title":"VP Engineering", "pic":"vite.svg", "parent":1},
        {"key":5, "name":"Saul Wellingood", "title":"Manufacturing", "pic":"vite.svg", "parent":4},
        {"key":6, "name":"Al Ligori", "title":"Marketing", "pic":"vite.svg", "parent":2},
        {"key":7, "name":"Dot Stubadd", "title":"Sales Rep", "pic":"vite.svg", "parent":3},
        {"key":8, "name":"Les Ismore", "title":"Project Mgr", "pic":"vite.svg", "parent":5},
        {"key":9, "name":"April Lynn Parris", "title":"Events Mgr", "pic":"vite.svg", "parent":6},
        {"key":10, "name":"Xavier Breath", "title":"Engineering", "pic":"vite.svg", "parent":4},
        {"key":11, "name":"Anita Hammer", "title":"Process", "pic":"vite.svg", "parent":5},
        {"key":12, "name":"Billy Aiken", "title":"Software", "pic":"vite.svg", "parent":10},
        {"key":13, "name":"Stan Wellback", "title":"Testing", "pic":"vite.svg", "parent":10},
        {"key":14, "name":"Marge Innovera", "title":"Hardware", "pic":"vite.svg", "parent":10},
        {"key":15, "name":"Evan Elpus", "title":"Quality", "pic":"vite.svg", "parent":5},
        {"key":16, "name":"Lotta B. Essen", "title":"Sales Rep", "pic":"vite.svg", "parent":3}
        ]
      }
    );
    // make sure new data keys are unique positive integers
    let lastkey = 1;
    diagram.model.makeUniqueKeyFunction = (model, data) => {
      let k = data.key || lastkey;
      while (model.findNodeDataForKey(k)) k++;
      data.key = lastkey = k;
      return k;
    };
  }

  

  const onModelChange: (obj: go.IncrementalData) => void = (obj: go.IncrementalData) => {
    console.log(obj);
  }



  return (
    <ReactDiagram
        ref={diagramRef}
        initDiagram={initDiagram}
        divClassName='diagram-component'
        style={{
          width: '100%',
          height: '80%'
        }}
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
        modelData={modelData}
        skipsDiagramUpdate={skipsDiagramUpdate}
        onModelChange={onModelChange}
      />
  )
}

