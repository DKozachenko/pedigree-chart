import * as go from 'gojs';

// https://gojs.net/latest/samples/genogram.html
export class GenogramLayout extends go.LayeredDigraphLayout {
  spouseSpacing: number = 0;

  constructor() {
    super();
    this.alignOption = go.LayeredDigraphLayout.AlignAll;
    this.initializeOption = go.LayeredDigraphLayout.InitDepthFirstIn;
    // минимальное расстояние между супругами
    this.spouseSpacing = 30;
    this.isRouting = false;
  }

  public makeNetwork(coll: go.Diagram | go.Group | go.Iterable<go.Node>): go.LayeredDigraphNetwork {
    // генерация LayoutEdges для каждой родительско-дочерней ссылки
    const netword: go.LayeredDigraphNetwork = this.createNetwork();
    if (coll instanceof go.Diagram) {
      this.add(netword, coll.nodes, true);
      this.add(netword, coll.links, true);
    } else if (coll instanceof go.Group) {
      this.add(netword, coll.memberParts, false);
    } else if (coll.iterator) {
      this.add(netword, coll.iterator, false);
    }
    return netword;
  }

  // внутренний метод для создания LayeredDigraphNetwork, где представлены пары муж/жена
  // по одному LayeredDigraphVertex, соответствующему метке Node на брачной ссылке
  add(network: go.LayeredDigraphNetwork, coll: go.Iterator<go.Node | go.Link | go.Part>, nonMemberOnly: boolean): void {
    const horizontally: boolean = this.direction == 0.0 || this.direction == 180.0;
    const multiSpousePeople: go.Set<go.Node> = new go.Set<go.Node>();

    const it: go.Iterator<go.Node | go.Part | go.Link> = coll.iterator;
    while (it.next()) {
      const node: go.Node | go.Part | go.Link = it.value;
      if (!(node instanceof go.Node) || !node.data) {
        continue;
      }
      if (!node.isLayoutPositioned || !node.isVisible()) { 
        continue; 
      }
      if (nonMemberOnly && node.containingGroup !== null) { 
        continue; 
      }

      // если это одиночный узел или узел метки ссылки, создаем для него LayoutVertex
      if (node.isLinkLabel) {
        // получение ссылки на "брак"
        const link: go.Link = <go.Link>node.labeledLink;
        if (link.category === "Marriage") {
          const spouseA: go.Node = <go.Node>link.fromNode;
          const spouseB: go.Node = <go.Node>link.toNode;
          // создание вершины, представляющей мужа и жену
          const vertex: go.LayoutVertex = network.addNode(node);
          // определение размера вершины, чтобы она мог вместить обоих супругов
          if (horizontally) {
            vertex.height = spouseA.actualBounds.height + this.spouseSpacing + spouseB.actualBounds.height;
            vertex.width = Math.max(spouseA.actualBounds.width, spouseB.actualBounds.width);
            vertex.focus = new go.Point(vertex.width / 2, spouseA.actualBounds.height + this.spouseSpacing / 2);
          } else {
            vertex.width = spouseA.actualBounds.width + this.spouseSpacing + spouseB.actualBounds.width;
            vertex.height = Math.max(spouseA.actualBounds.height, spouseB.actualBounds.height);
            vertex.focus = new go.Point(spouseA.actualBounds.width + this.spouseSpacing / 2, vertex.height / 2);
          }
        }
      } else {
        // не добавляйте вершину для женатых людей!
        // вместо этого код выше добавляет узел метки для ссылки на "брак"
        // предположим, что брачная ссылка имеет метку Node
        let marriages: number = 0;
        node.linksConnected.each((link: go.Link) => {
          if (link.category === "Marriage") {
            marriages++;
          } 
        });
        
        if (marriages === 0) {
          network.addNode(node);
        } else if (marriages > 1) {
          multiSpousePeople.add(node);
        }
      }
    }
    // создание всех ссылок
    it.reset();
    while (it.next()) {
      const link: go.Node | go.Part | go.Link = it.value;
      if (!(link instanceof go.Link)) { 
        continue; 
      }

      if (!link.isLayoutPositioned || !link.isVisible()) { 
        continue; 
      }

      if (nonMemberOnly && link.containingGroup !== null) { 
        continue; 
      }

      // если это родительско-дочерняя ссылка, добавление для нее LayoutEdge
      if (link.category === "" && link.data) {
        const parent: go.LayoutVertex = <go.LayoutVertex>network.findVertex(<go.Node>link.fromNode); // должен быть узлом
        const child: go.LayoutVertex | null = network.findVertex(<go.Node>link.toNode);
        if (child !== null) { // неженатый ребенок
          network.linkVertexes(parent, child, link);
        } else { // женатый ребенок
          (link.toNode as go.Node).linksConnected.each((connectedLink: go.Link) => {
            if (connectedLink.category !== "Marriage" || !connectedLink.data) { 
              return;  // если у него нет узла метки, это родительско-дочерняя ссылка
            } 
            // после нахождения ссылки на "брак", получение ее метки Node
            const marrigeLabel: go.Node = <go.Node>connectedLink.labelNodes.first();
            // родительско-дочерняя связь должна соединяться с узлом метки,
            // поэтому LayoutEdge должен соединиться с LayoutVertex, представляющим узел метки
            const marrigeLabelVertext: go.LayoutVertex | null = network.findVertex(marrigeLabel);
            if (marrigeLabelVertext !== null) {
              network.linkVertexes(parent, marrigeLabelVertext, link);
            }
          });
        }
      }
    }

    while (multiSpousePeople.count > 0) {
      // поиск коллекции людей, состоящих в "непрямом" браке друг с другом
      const node: go.Node = <go.Node>multiSpousePeople.first();
      const cohort: go.Set<go.Node> = new go.Set<go.Node>();
      this.extendCohort(cohort, node);
      // соедение их всех общей вершиной
      const dummyVertex: go.LayoutVertex = network.createVertex();
      network.addVertex(dummyVertex);
      const marriages: go.Set<go.Link> = new go.Set<go.Link>();
      cohort.each((cohortNode: go.Node) => {
        cohortNode.linksConnected.each((connectedLink: go.Link) => {
          marriages.add(connectedLink);
        })
      });
      marriages.each((link: go.Link) => {
        // находим вершину для ссылки на "брак" (т.е. для узла метки)
        const mariageLabel: go.Node = <go.Node>link.labelNodes.first()
        const vertex: go.LayoutVertex | null = network.findVertex(mariageLabel);
        if (vertex !== null) {
          network.linkVertexes(dummyVertex, vertex, null);
        }
      });

      multiSpousePeople.removeAll(cohort);
    }
  }

  // сбор всех людей, состоящих в "непрямом" браке с человеком
  extendCohort(collection: go.Set<go.Node>, node: go.Node): void {
    if (collection.has(node)) { 
      return; 
    }

    collection.add(node);
    node.linksConnected.each((connectedLink: go.Link) => {
      if (connectedLink.category === "Marriage") { // если это ссылка на "брак"
        this.extendCohort(collection, <go.Node>connectedLink.fromNode);
        this.extendCohort(collection, <go.Node>connectedLink.toNode);
      }
    });
  }

  assignLayers(): void {
    super.assignLayers();
    const horizontally: boolean = this.direction == 0.0 || this.direction == 180.0;
    // для каждой вершины нужно запомнить максимальную ширину или высоту ее слоя
    const maxSizes: number[] = [];
    (this.network as go.LayoutNetwork).vertexes.each((networkVertex: go.LayoutVertex) => {
      const vertexLayer: number = (networkVertex as go.LayoutVertex & { layer: number }).layer;
      let max: number = maxSizes[vertexLayer];
      if (max === undefined) { 
        max = 0;
      }
      const size = horizontally ? networkVertex.width : networkVertex.height;
      if (size > max) { 
        maxSizes[vertexLayer] = size; 
      }
    });
    // обощение ширины и высоты каждой вершины вне зависимости от того, на каком слое она находится
    (this.network as go.LayoutNetwork).vertexes.each((networkVertex: go.LayoutVertex) => {
      const vertexLayer: number = (networkVertex as go.LayoutVertex & { layer: number }).layer;
      const maxSize: number = maxSizes[vertexLayer];
      if (horizontally) {
        networkVertex.focus = new go.Point(0, networkVertex.height / 2);
        networkVertex.width = maxSize;
      } else {
        networkVertex.focus = new go.Point(networkVertex.width / 2, 0);
        networkVertex.height = maxSize;
      }
    });
    // с этого момента LayeredDigraphLayout будет думать, что Node больше, чем он есть на самом деле
  }

  initializeIndices(): void {
    super.initializeIndices();
    const vertical: boolean = this.direction === 90 || this.direction === 270;

    (this.network as go.LayoutNetwork).edges.each((networkEdge: go.LayoutEdge) => {
      const fromVertex: go.LayoutVertex = <go.LayoutVertex>networkEdge.fromVertex;
      const toVertex: go.LayoutVertex = <go.LayoutVertex>networkEdge.toVertex;

      if (fromVertex.node && fromVertex.node.isLinkLabel) {
        (networkEdge as go.LayoutEdge & { portFromPos: number }).portFromPos = vertical ? fromVertex.focusX : fromVertex.focusY;
      }
      if (toVertex.node && toVertex.node.isLinkLabel) {
        (networkEdge as go.LayoutEdge & { portToPos: number }).portToPos = vertical ? toVertex.focusX : toVertex.focusY;
      }
    })
  }

  commitNodes(): void {
    super.commitNodes();
    // позиционирование обычных узлов
    (this.network as go.LayoutNetwork).vertexes.each((networkVertex: go.LayoutVertex) => {
      if (networkVertex.node !== null && !networkVertex.node.isLinkLabel) {
        networkVertex.node.position = new go.Point(networkVertex.x, networkVertex.y);
      }
    });

    const horizontally = this.direction == 0.0 || this.direction == 180.0;
    // позиционирование супругов
    (this.network as go.LayoutNetwork).vertexes.each((networkVertex: go.LayoutVertex) => {
      if (networkVertex.node === null) { 
        return;
      }

      if (!networkVertex.node.isLinkLabel) { 
        return; 
      }

      const labelNode: go.Node = networkVertex.node;
      const labelLink: go.Link = <go.Link>labelNode.labeledLink;
      // в случае, если супруги на самом деле не двигаются, нам нужна ссылка на "брак"
      // позиционирование узла метки, потому что LayoutVertex.commit() был вызван выше для этих вершин.
      labelLink.invalidateRoute();
      let spouseA: go.Node = <go.Node>labelLink.fromNode;
      let spouseB: go.Node = <go.Node>labelLink.toNode;
      if (spouseA.opacity > 0 && spouseB.opacity > 0) {
        // предпочтение к расположению отцов слева, матерей справа
        if (spouseA.category === "F") {  // пол женский
          const temp = spouseA;
          spouseA = spouseB;
          spouseB = temp;
        }
        // проверка, находятся ли родители на нужных сторонах, чтобы избежать пересечения ссылок
        const aParentsNode = this.findParentsMarriageLabelNode(spouseA);
        const bParentsNode = this.findParentsMarriageLabelNode(spouseB);
        if (aParentsNode !== null && bParentsNode !== null &&
            (horizontally
              ? aParentsNode.position.x > bParentsNode.position.x
              : aParentsNode.position.y > bParentsNode.position.y)) {
          // меняет суругов
          const temp = spouseA;
          spouseA = spouseB;
          spouseB = temp;
        }
        spouseA.moveTo(networkVertex.x, networkVertex.y);
        if (horizontally) {
          spouseB.moveTo(networkVertex.x, networkVertex.y + spouseA.actualBounds.height + this.spouseSpacing);
        } else {
          spouseB.moveTo(networkVertex.x + spouseA.actualBounds.width + this.spouseSpacing, networkVertex.y);
        }
      } else if (spouseA.opacity === 0) {
        const pos = horizontally
          ? new go.Point(networkVertex.x, networkVertex.centerY - spouseB.actualBounds.height / 2)
          : new go.Point(networkVertex.centerX - spouseB.actualBounds.width / 2, networkVertex.y);
        spouseB.move(pos);
        if (horizontally) pos.y++; else pos.x++;
        spouseA.move(pos);
      } else if (spouseB.opacity === 0) {
        const pos = horizontally
          ? new go.Point(networkVertex.x, networkVertex.centerY - spouseA.actualBounds.height / 2)
          : new go.Point(networkVertex.centerX - spouseA.actualBounds.width / 2, networkVertex.y);
        spouseA.move(pos);
        if (horizontally) { 
          pos.y++; 
        } else { 
          pos.x++; 
        }

        spouseB.move(pos);
      }
      labelLink.ensureBounds();
    });
  }

  findParentsMarriageLabelNode(node: go.Node): go.Node | null {
    const it: go.Iterator<go.Node> = node.findNodesInto();
    while (it.next()) {
      const childNode: go.Node = it.value;
      if (childNode.isLinkLabel) { 
        return childNode; 
      }
    }
    return null;
  }
}
