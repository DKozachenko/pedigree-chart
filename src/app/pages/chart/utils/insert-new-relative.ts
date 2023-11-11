import * as go from 'gojs';

export function insertNewRelative(loc: go.Point): go.Part | null {
  const node: go.Part | null = go.ClickCreatingTool.prototype.insertPart.call(this, loc);
  const diagram: go.Diagram | null | undefined = node?.diagram;

  if (!node || !diagram) {
    return null;
  }

  diagram.select(node);
  diagram.commandHandler.scrollToPart(node);
  const nodeNameTextBlock: go.GraphObject | null = node.findObject('NAMETB');

  if (nodeNameTextBlock) {
    diagram.commandHandler.editTextBlock(<go.TextBlock>nodeNameTextBlock);
  }

  return node;
}
