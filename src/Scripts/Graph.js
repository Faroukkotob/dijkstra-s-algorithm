class Graph {
    constructor() {
      this.vertices = [];
      this.edges = {}; // Adjacency-list representation
      this.numberOfEdges = 0;
    }

    addVertex(vertex) {
      this.vertices.push(vertex); // Push new vertex ID to vertex list
      this.edges[vertex] = []; // Instantiate new vertex edge list
    }
  
    removeVertex(vertex) {
      // Index of vertex in vertex list
      const index = this.vertices.indexOf(vertex);
      // If vertex exists...
      if (index !== -1) {
        this.vertices.splice(index, 1); // Remove vertex from vertex list
      }
      // While there are edges to vertex...
      while (this.edges[vertex].length) {
        const adjacentVertex = this.edges[vertex].pop(); // Get neighbour
        this.removeEdge(adjacentVertex, vertex); // Remove edge between vertex and neighbour
      }
    }

    addEdge(vertex1, vertex2, weight) {
      // Add vertex2 to vertex1's edge list, with weight
      this.edges[vertex1].push({name: vertex2, weight});
      // Add vertex1 to vertex2's edge list, with weight
      this.edges[vertex2].push({name: vertex1, weight});
      this.numberOfEdges++; // Increment edge count
    }

    modifyEdgeWeight(vertex1, vertex2, weight) {
      // Change associated weight for vertex2 in vertex1's edge list
      this.edges[vertex1].find(ele => ele.name === vertex2).weight = weight;
      // Change associated weight for vertex1 in vertex2's edge list
      this.edges[vertex2].find(ele => ele.name === vertex1).weight = weight;
    }

    removeEdge(vertex1, vertex2) {
      // Index of vertex2 in vertex1's edge list
      const index1 = this.edges[vertex1] ? this.edges[vertex1].indexOf(vertex2) : -1;
      // Index of vertex1 in vertex2's edge list
      const index2 = this.edges[vertex2] ? this.edges[vertex2].indexOf(vertex1) : -1;
      // If edge exists... 
      if (index1 !== -1) {
        this.edges[vertex1].splice(index1, 1); // Remove vertex2 from vertex1's edge list
        this.numberOfEdges--; // Decrement edge count
      }
      if (index2 !== -1) {
        this.edges[vertex2].splice(index2, 1); // Remove vertex1 from vertex2's edge list
      }
    }
  
    size() {
      return this.vertices.length;
    }
  
    relations() {
      return this.numberOfEdges;
    }
  
    print() {
      console.log("Test");
      console.log(this.vertices.map(vertex => {
        return `${vertex} -> ${this.edges[vertex].join(', ')}`;
      }).join(' | '));
    }
  }
