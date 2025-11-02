// ==================== PART 2.1: SIDE-BY-SIDE BOXPLOT ====================

// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 50, bottom: 60, left: 60 },
          width = 700 - margin.left - margin.right,
          height = 450 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.AgeGroup))])
        .range([0, width])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)]).nice()
        .range([height, 0]);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Age Group");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Number of Likes");

    // Calculate quartiles
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return { min, q1, median, q3, max };
    };

    // Group by AgeGroup and compute quartiles
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    // Draw boxplots
    quantilesByGroups.forEach((q, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();

        // Vertical line (min → max)
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(q.min))
            .attr("y2", yScale(q.max))
            .attr("stroke", "black");

        // Box (q1 → q3)
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(q.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(q.q1) - yScale(q.q3))
            .attr("fill", "#69b3a2")
            .attr("stroke", "black");

        // Median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(q.median))
            .attr("y2", yScale(q.median))
            .attr("stroke", "black");
    });
});


// ==================== PART 2.2: SIDE-BY-SIDE BAR PLOT ====================

// Load summarized dataset (Platform, PostType, AvgLikes)
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const margin = { top: 50, right: 30, bottom: 80, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#barplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    const x0 = d3.scaleBand()
        .domain(platforms)
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(postTypes)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)]).nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(postTypes)
        .range(["#4e79a7", "#f28e2b", "#e15759"]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Platform");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Average Likes");

    // Group and draw bars
    const group = svg.selectAll(".platform")
        .data(platforms)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d)},0)`);

    group.selectAll("rect")
        .data(d => data.filter(e => e.Platform === d))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.PostType))
        .attr("y", d => y(d.AvgLikes))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.AvgLikes))
        .attr("fill", d => color(d.PostType));

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 0)`);

    const types = [...new Set(data.map(d => d.PostType))];
    types.forEach((type, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color(type));
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 10)
            .text(type)
            .attr("alignment-baseline", "middle");
    });
});


// ==================== PART 2.3: LINE PLOT ====================

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    data.forEach(d => d.AvgLikes = +d.AvgLikes);

    const margin = { top: 50, right: 30, bottom: 80, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#lineplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
        .domain(data.map(d => d.Date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)]).nice()
        .range([height, 0]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-25)");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Average Likes");

    // Line generator
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.AvgLikes))
        .curve(d3.curveNatural);

    // Draw line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 2)
        .attr("d", line);
});
