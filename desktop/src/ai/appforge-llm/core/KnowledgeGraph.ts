export interface GraphNode {
  name: string;
  type: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

export class KnowledgeGraph {
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];

  constructor() {
    this.initStaticGraph();
  }

  private initStaticGraph() {
    // Core nodes
    this.addNode('Hospital', 'Industry');
    this.addNode('Doctor', 'Role');
    this.addNode('Patient', 'Role');
    this.addNode('Admin', 'Role');
    this.addNode('Appointment', 'Feature');
    this.addNode('Prescription', 'Feature');
    this.addNode('Billing', 'Feature');

    this.addNode('Ecommerce', 'Industry');
    this.addNode('Buyer', 'Role');
    this.addNode('Seller', 'Role');
    this.addNode('Product Catalog', 'Feature');
    this.addNode('Shopping Cart', 'Feature');
    this.addNode('Checkout', 'Feature');

    // Hospital relations
    this.addEdge('Hospital', 'Doctor', 'defines_role');
    this.addEdge('Hospital', 'Patient', 'defines_role');
    this.addEdge('Doctor', 'Appointment', 'reviews_schedule');
    this.addEdge('Patient', 'Appointment', 'requests_booking');
    this.addEdge('Doctor', 'Prescription', 'prescribes');
    this.addEdge('Patient', 'Prescription', 'obtains');
    this.addEdge('Patient', 'Billing', 'makes_payment');

    // E-Commerce relations
    this.addEdge('Ecommerce', 'Buyer', 'defines_role');
    this.addEdge('Ecommerce', 'Seller', 'defines_role');
    this.addEdge('Seller', 'Product Catalog', 'manages');
    this.addEdge('Buyer', 'Shopping Cart', 'selects_items');
    this.addEdge('Buyer', 'Checkout', 'performs');
  }

  addNode(name: string, type: string) {
    this.nodes.set(name, { name, type });
  }

  addEdge(from: string, to: string, relation: string) {
    this.edges.push({ from, to, relation });
  }

  getRelatedNodes(nodeName: string): string[] {
    return this.edges
      .filter(e => e.from.toLowerCase() === nodeName.toLowerCase() || e.to.toLowerCase() === nodeName.toLowerCase())
      .map(e => (e.from.toLowerCase() === nodeName.toLowerCase() ? e.to : e.from));
  }
}
