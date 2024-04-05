class LinkState {
    constructor() {
        this.routingTables = {};
    }

    constructRoutingTable(source, dTable) {
      // Initializes Routing Table for Source
      this.routingTables[source] = {};

      // Self destination means 0 cost and no hop
      this.routingTables[source][source] = {
        cost: 0,
        hop: null
      };

      // For each destination in Dijkstra's algorithm result...
      for(const destination in dTable) {
        let current = destination;
        let prev = null;

        // While not at the end of the chain (backwards from destination towards self)
        while(dTable[current].prev !== null) {
          // Save the last node in the chain
          prev = current;
          current = dTable[current].prev;
        }

        // Use total distance from Dijkstra's and first node in path to dest.
        this.routingTables[source][destination] = {
          cost: dTable[destination].distance,
          hop: prev
        };
      }
    }

    /*
        returns table = {
          1: {distance: 0, prev: null},
          2: {distance: 3, prev: 1},
          3: {distance: 6, prev: 2}
        }
    */
    dijkstra(graph, source) {
        let table = {}; // Table holding distances and previous nodes
        let visited = new Set(); // Set holding nodes already visited

        // Set all distances to infinity, all previous nodes to null
        for(let i = 0; i < graph.vertices.length; i++) {
            table[graph.vertices[i]] = {
                distance: Infinity,
                prev: null
            };
        }
        // Start with source, distance is 0
        table[source] = {
            distance: 0,
            prev: null
        }

        // Change to remaining node with lowest distance
        let current = this.getMinDistanceVertex(table, visited);

        // While there are still nodes to visit...
        while(current !== null) {
            let distance = table[current].distance; // Distance to currently considered node
            let neighbours = graph.edges[current]; // Neighbours of currently considered node

            // For each neighbour...
            for(const neighbour of neighbours) {
                // Distance to current node + additional distance to neighbour
                let newDist = distance + neighbour.weight;

                // If new distance is less than old distance for this neighbour
                if(table[neighbour.name].distance > newDist) {
                    // Update distance and prev for neighbour in result table
                    table[neighbour.name] = {
                        distance: newDist,
                        prev: current
                    }
                }
            }
            visited.add(current); // Node processing is done, add to visited
            current = this.getMinDistanceVertex(table, visited); // Update current
        }

        return table;
    }
         
    getMinDistanceVertex(table, visited) {
        let minDistance = Infinity; // Start comparison with lowest possible distance
        let minVertex = null; // Remaining vertex with lowest distance (unknown at start)
        
        // For each vertex in the graph...
        for (let vertex in table) {
            vertex = parseInt(vertex); // Prevent type errors

            let distance = table[vertex].distance; // Get distance for current vertex from result table
            // If distance is current lowest distance and vertex has not been visited...
            if(distance < minDistance && !visited.has(vertex)) {
                minDistance = distance; // Update lowest distance
                minVertex = vertex; // Save remaining vertex with lowest distance
            }
        }
        
        return minVertex;
    }

    solve(graph) {
        // Centralized network algorithm, each node/router must execute Dijkstra's algorithm
        // on the graph/network topology to construct its routing table
        for(const source of graph.vertices) {
            this.constructRoutingTable(source, this.dijkstra(graph, source));
        }
    }
  
    getPaths(vertex) {
      var paths = {}; // Object to store paths from vertex to all destinations

      // For each destination in the routing table...
      for(const destination in this.routingTables[vertex]) {
          var path = []; // Initialize current path
          var current = vertex; // Currently considered node from start
          var currentHop = this.routingTables[current][destination].hop; // Next hop in chain
          // While next hop exists...
          while(currentHop !== null) {
              path.push(currentHop); // Add next hop to path
              current = currentHop; // Update current to move along
              currentHop = this.routingTables[current][destination].hop; // Update next hop
          }
          paths[destination] = path; // Add final path to object
      }

      return paths;
  }

}
