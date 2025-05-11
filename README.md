<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Reservation - South Western Railways</title>
    <style>
        body {
            background-color: green;
            color: white;
            font-family: Arial, sans-serif;
        }
        h1 {
            text-align: center;
            color: yellow;
        }
        table {
            width: 90%;
            margin: auto;
            background-color: #500067;
            color: white;
            border-collapse: collapse;
        }
        table td {
            padding: 10px;
        }
        .center {
            text-align: center;
        }
        input, select, textarea {
            width: 100%;
            padding: 5px;
            margin: 5px 0;
        }
        textarea {
            resize: vertical;
        }
        .button-container {
            text-align: center;
            margin-top: 20px;
        }
        .button-container input {
            padding: 10px 20px;
            margin: 5px;
            font-size: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1><marquee>HAPPY JOURNEY !!!!</marquee></h1>
    <h1>Online Reservation - South Western Railways</h1>
    <form>
        <table>
            <tr>
                <td>Train Number & Name</td>
                <td><input type="text" name="train_number" placeholder="Train Number & Name"></td>
                <td>Class</td>
                <td>
                    <select name="class">
                        <option value="">Select Class</option>
                        <option value="1A">1st Class</option>
                        <option value="2A">2nd Class</option>
                        <option value="3A">3rd Class</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Date of Journey</td>
                <td><input type="date" name="date_of_journey"></td>
                <td>Station From</td>
                <td>
                    <select name="station_from">
                        <option value="">Select Station</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Trichy">Trichy</option>
                        <option value="Erode">Erode</option>
                        <option value="Karur">Karur</option>
                        <option value="Madurai">Madurai</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Station To</td>
                <td>
                    <select name="station_to">
                        <option value="">Select Station</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Trichy">Trichy</option>
                    </select>
                </td>
                <td>Children Below 5 Years</td>
                <td><input type="number" name="children_below_5" min="0" placeholder="Number of Children"></td>
            </tr>
            <tr>
                <td>Name</td>
                <td><input type="text" name="name" placeholder="Your Name"></td>
                <td>Gender</td>
                <td>
                    <select name="gender">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Cell Number</td>
                <td><input type="tel" name="cell_number" placeholder="Your Cell Number"></td>
                <td>Full Address</td>
                <td><textarea name="full_address" rows="3" placeholder="Your Full Address"></textarea></td>
            </tr>
            <tr>
                <td>Additional Information</td>
                <td colspan="3"><textarea name="additional_info" rows="3" placeholder="Any Additional Information"></textarea></td>
            </tr>
        </table>
        <div class="button-container">
            <input type="submit" value="Print">
            <input type="button" value="Save & Proceed" onclick="alert('Form saved! Proceeding...');">
        </div>
    </form>
</body>
</html>
