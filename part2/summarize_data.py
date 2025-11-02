import pandas as pd

# Load your data
df = pd.read_csv("socialMedia.csv")

# Compute averages by Platform and PostType
avg_df = df.groupby(["Platform", "PostType"], as_index=False)["Likes"].mean()
avg_df.rename(columns={"Likes": "AvgLikes"}, inplace=True)
avg_df.to_csv("socialMediaAvg.csv", index=False)

# Compute averages by Date
time_df = df.groupby(["Date"], as_index=False)["Likes"].mean()
time_df.rename(columns={"Likes": "AvgLikes"}, inplace=True)
time_df.to_csv("socialMediaTime.csv", index=False)

print("✅ CSVs created: socialMediaAvg.csv and socialMediaTime.csv")
