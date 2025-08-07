### JAJM Automation Guide.

###### Step 1: Get Your Files Ready

1. Open your jersey design in Photoshop.
2. Create a text file named `players.txt` and save it in the same folder as your Photoshop design.

###### Step 2: Setup Photoshop

- In your Photoshop file, you MUST have three text layers named exactly:
    -   `lastname`
    -   `number`
    -   `size`

###### Step 3: Fill in the Player List

- Open your `players.txt` file.
- The very first line must be: `lastname,number,size`
-   On the next lines, add your players like this (one player per line):
    ```
    SMITH,10,L
    JONES,23,XL
    BROWN,5,M
    ```

###### Step 4: Run the Tool

1.  Go back to Photoshop.
2.  Click `File` > `Scripts` > `Browse...`
3.  Select the `jersey-automation.jsx` file and click Open.

All Done!

A new folder named `save` will be created with all your finished jersey images inside.
