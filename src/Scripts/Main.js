// Variable instances for session
var graph = new Graph(); // Graph data structure for network
var distanceVector = new DistanceVector(); // Distance-Vector algorithm object
var linkState = new LinkState(); // Link-State algorithm object

// Local variables for constructing network GUI
var count = 0; // Number of nodes in network
var selectedNode = []; // Buffer for selected nodes (2 at a time, for edge creation)
var nodeList = []; // Nodes in graph, bookkeeping of HTML IDs and coordinates
var edgeList = []; // Edges in graph, bookeeping of HTML IDs and coordinates
var MODE = 'CREATE'; // Operation mode enumeration
var lastRunType = ''; // Store type of algorithm that was last executed

// Change operation mode
const handleMode = (event, selectMode) => {
    event.preventDefault();
    MODE  = selectMode ; 
}

// Modify weight in data structure
const modifyWeight = (event) =>{
    event.preventDefault();
    const {vertex1,vertex2} = event.data
    // If entered weight is not positive, default to 1
    if(parseInt(event.target.value) <= 0) {
        event.target.value = '1';
    }
    this.graph.modifyEdgeWeight(vertex1,vertex2, parseInt(event.target.value));
}

// When a user clicks on a node...
const selectNode = (event, coorObj, name) => {
    event.preventDefault();
    var board = $("#MainBoard");
    if (MODE === 'SELECT') {
        // Add node to selectedNodes buffer
        selectedNode.push({name:event.target.id, ...coorObj});
        // If two nodes are now selected...
        if (selectedNode.length === 2) {
            // Add edge between selected nodes to data structure (default weight is current number of nodes)
            graph.addEdge(parseInt(selectedNode[0].name), parseInt(selectedNode[1].name), count);
            
            // Geometry for edge length, width, angle
            var edge = $("<div class='edge'></div>");
            const x1 = selectedNode[0].x;
            const x2 = selectedNode[1].x;
            const y1 = selectedNode[0].y;
            const y2 = selectedNode[1].y;
            const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
            const middleX = (x1 + x2) / 2 - (length / 2);
            const middleY = (y1 + y2) / 2 - (3 / 2);
            const angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
            // Graphically attach weight to edge (default is current number of nodes)
            var weight = $(`<input type='text' value='${count}' placeholder='${count}'></input>`).css({
                position: "absolute",
                'z-index':-1,
                border: "none",
                transform: `rotate(${-angle}deg)`,  
                'text-align': 'center',
                width:'min-content',
                height:'min-content',
                'background-color':'transparent'
            });
            
            // Weight as input field, modifies weight on change
            weight.on('change', {vertex1: parseInt(selectedNode[0].name), vertex2: parseInt(selectedNode[1].name)}, modifyWeight)
            edge.append(weight); // Add HTML weight to HTML edge
            
            // Define styling for edge (default red)
            edge.css({                          
                position: "absolute",
                left: middleX + "px",
                top: middleY + "px",
                width: length + "px",
                'border-top': "3px solid rgba(255, 0, 0, 0.4)",
                cursor: "pointer",
                display: "flex",
                'z-index':1,
                'justify-content': "center"
            });

            // Defines ID for edge as '#[lower node ID]-[higher node ID]'
            edge.attr('id', (parseInt(selectedNode[0].name) > parseInt(selectedNode[1].name) ? selectedNode[1].name : selectedNode[0].name) + "-" + 
                (parseInt(selectedNode[0].name) > parseInt(selectedNode[1].name) ? selectedNode[0].name : selectedNode[1].name));
            edge.css('transform', `rotate(${angle}deg)`); // Rotates edge last
            
            
            board.append(edge); // Add HTML edge to HTML board
            selectedNode = []; // Reset selected nodes

            //Bookkeep the edge
            const edgeObj = {
                Node1: {coord:{ x: x1, y : y1} },
                Node2: {coord: {x: x2,y : y2} },
                value: count
            }
            edgeList.push(edgeObj);
        }
    } else if (MODE === 'VIEWROUTES') {
        viewRoutes(event); // Display calculates throughput routes for selected node
    }
}

// Add node to network
const addNode = (event)=>{
    if(MODE === 'CREATE'){
        // Increase count, add node to data structure
        count += 1;
        graph.addVertex(count);

        // HTML creation of node
        event.preventDefault();
        const x = event.offsetX;
        const y = event.offsetY;
        var board = $("#MainBoard");
        var blockTemplate = $("<div></div>");
        blockTemplate.addClass("Block");
        blockTemplate.attr('id', count+""); // Define node ID as current number of nodes
        blockTemplate.css({top:y ,left: x, position:'absolute' ,color:"black"} );
        blockTemplate.append(""+count);
        // Define click response of node to correlate to node ID and coordinates
        blockTemplate.click((e)=>selectNode(e,{x,y},count));

        board.append(blockTemplate); // Add HTML node to HTML board

        // Bookkeep the node
        const nodeObj = {
            id: count , 
            position:{x: x ,y: y}
        }
        nodeList.push(nodeObj);
    }
}

// Display routing tables in component
const displayRoutingTables = (routingTables) => {
    $('#RoutingTables').html(''); // Reset inner HTML
    // For each node in passed routing tables...
    for(const node in routingTables) {
        var html = `<h3>Node ${node}</h3>`; // Header: 'Node [Node ID]'
        html += `<table><tr><th>Destination</th><th>Cost</th><th>Hop</th></tr>`; // Table headers (Dest. -> Cost -> Hop)
        // For each destination in a node's routing table...
        for(const destination in routingTables[node]) {
            // Add row with respective data
            html += `<tr><td>${destination}</td>`;
            html += `<td>${routingTables[node][destination].cost}</td>`;
            html += `<td>${(routingTables[node][destination].hop) == null ? 'X' : routingTables[node][destination].hop}</td></tr>`;
        }
        html += `</table>`; // Close table
        $('#RoutingTables').append(html); // Add HTML table
    }
}

// View calculated throughput routes for a given node
const viewRoutes = (event) => {
    const node = parseInt(event.target.id); // Get node ID
    var paths = {}; // Instantiate object to hold paths

    // Get appropriate routing tables based off algorithm run
    if(lastRunType === 'dv') {
        if(distanceVector.routingTables === {}) {return;}
        paths = distanceVector.getPaths(node);
    } else if(lastRunType === 'ls') {
        if(linkState.routingTables === {}) {return;}
        paths = linkState.getPaths(node);
    } else {return;}

    // Reset all edges to red
    $(".edge").each(function(index, element) { 
        $(element).css({
            'border-top-color': 'rgba(255, 0, 0, 0.4)'
        });
    })

    var edgeId = '';
    // For each destination...
    for(const destination in paths) {
        var previous = node;
        // For each node in hop chain to reach destination...
        for(const hop of paths[destination]) {
            // Make edge from previous hop to current hop turn green
            edgeId = '#' + (previous < hop ? previous : hop) + '-' + (previous < hop ? hop : previous);
            $(edgeId).css({
                'border-top-color': 'mediumseagreen'
            });
            previous = hop;
        }
    }
}

// Run the centralized or decentralized routing algorithm
const runAlgorithm = (event, type) => {
    if(type === 'dv') {
        distanceVector.solve(graph);
        displayRoutingTables(distanceVector.routingTables);
    } else if(type === 'ls') {
        linkState.solve(graph);
        displayRoutingTables(linkState.routingTables);
    }
    lastRunType = type;
}
