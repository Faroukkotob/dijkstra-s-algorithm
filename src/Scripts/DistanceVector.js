class DistanceVector {
    constructor() {
        /*
            routingTables: {
                1: {
                    1: {cost: 0, hop: null},
                    2: {cost: 1, hop: 2},
                    3: {cost:2, hop: 2}
                },
                2: {
                    1: {cost: 1, hop: 1},
                    2: {cost: 0, hop: null},
                    3: {cost: 1, hop: 3}
                }
                3: {
                    1: {cost: 2, hop: 2},
                    2: {cost: 1, hop: 2},
                    3: {cost: 0, hop: null}
                }
            }
        */
        this.routingTables = {};
        this.change = true;
    }

    exchangeTables(router1, router2) {
        // Update router2's table with router1's information
        for(const destination in this.routingTables[router1]) {
            if(destination !== router1 && destination !== router2) {
                // New cost is d-v(y) + c(x, v) ... distance from router1 to dest + cost from router2 to router1
                var newCost = this.routingTables[router1][destination].cost + this.routingTables[router2][router1].cost;
                // If destination is NEW for router2...
                if(!this.routingTables[router2][destination]) {
                    this.change = true;
                    // Add destination to router2 table without comparison
                    this.routingTables[router2][destination] = {
                        cost: newCost,
                        hop: router1
                    };
                // If router2 has destination...
                } else {
                    // Bellman-Ford: d-x(y) = min-v{c(x, v) + d-v(y)}
                    if(newCost < this.routingTables[router2][destination].cost) {
                        this.change = true;
                        this.routingTables[router2][destination] = {
                            cost: newCost,
                            hop: router1
                        };
                    }
                }
            }
        }
    }

    solve(graph) {
        // Initializing Routing Tables
        for(const router of graph.vertices) {
            this.routingTables[router] = {};

            // Self destination means 0 cost and no hop
            this.routingTables[router][router] = {
                cost: 0,
                hop: null
            };

            // Immediate neighbours, weights as cost
            for(const neighbour of graph.edges[router]) {
                this.routingTables[router][neighbour.name] = {
                    cost: neighbour.weight,
                    hop: neighbour.name
                };
            }
        }

        // Decentralized is iterative, iterate V - 1 times
        for(var i = 0; i < graph.vertices.length - 1; i++) {
            // For each router (NO PRIORITY QUEUE)...
            for(const router of graph.vertices) {
                // For each neighbour of the router...
                for(const neighbour of graph.edges[router]) {
                    // Do not repeat edges (edge names are sorted, lower node -> higher node)
                    if(router < neighbour.name) {
                        this.exchangeTables(router, neighbour.name);
                        this.exchangeTables(neighbour.name, router);
                    }
                }
            }

            // If there is no new information exchanged during an iteration, we can stop
            if(!this.change) {
                break;
            }
            this.change = false;
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
