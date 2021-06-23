import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

import Snowfall from 'react-snowfall'

import Croissant1 from './assets/croissant_1.gif';
import Croissant2 from './assets/croissant_2.gif';
import Croissant3 from './assets/croissant_3.gif';
import CroissantPNG from './assets/croissant_png.png';

type Building = {
  id: string;
  name: string;
  max_floors: number;
}

type BuildingResponse = {
  buildings: Array<Building>;
}

type Croissant = {
  id: number;
  amount: number;
  location: {
    building: string;
    floor: number;
  };
  requester: string;
  time: string;
}

type CroissantCreateResponse = Croissant & {};

function App() {

  const [buildings, setBuildings] = useState<Array<Building>>([]);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [floor, setFloor] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [croissants, setCroissants] = useState<Array<Croissant>>([]);
  
  const createRequest = async () => {
    handleBlur();

    return fetch(
      "https://api.socgen.cloud/croissants", 
      { 
        method: "POST", 
        body: JSON.stringify({
          amount: amount || 0,
          location: { 
            building: currentBuilding?.id || "", 
            floor: floor || 0
          }, 
          requester: name || "", 
          time: new Date().toISOString() 
        }),
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    )
    .then((data) => data.json())
    .then(() => {
      setAmount(null);
      setFloor(null);
      setName(null);
    })
    .then(() => fetchCroissants())
    .catch((e) => console.error(e));
  };

  const fetchCroissants = async () => {
    return fetch(
      "https://api.socgen.cloud/croissants", 
      { 
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    )
    .then((data) => data.json())
    .then((data: { requests: Array<Croissant> }) => {
      setCroissants(data.requests);
    })
    .catch((e) => console.error(e));
  }

  const fetchBuildings = async () => {
    const resp = await fetch("https://api.socgen.cloud/buildings").then((data) => data.json()) as BuildingResponse;
    setBuildings(resp.buildings);
    setCurrentBuilding(resp.buildings[0]);
  };

  useEffect(() => {
    fetchBuildings();
    fetchCroissants();
  }, []);

  const handleCurrentBuildingChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextBuilding = buildings.find(v => v.id === e.target.value);
    if (nextBuilding) {
      setCurrentBuilding(nextBuilding);
    }
  }

  const handleInputChanged = (next: "AMOUNT" | "FLOOR" | "NAME") => (e: React.ChangeEvent<HTMLInputElement>) => {
    switch(next) {
      case "AMOUNT":
        setAmount(parseInt(e.target.value, 10));
        break;
      case "FLOOR":
        setFloor(parseInt(e.target.value, 10));
        break;
      case "NAME":
        setName(e.target.value);
        break;
      default:
        break;
    }
  }

  const handleDeleteCroissant = (id: number) => async () => {
    return fetch(
      `https://api.socgen.cloud/croissants/${id}`, 
      {
        method: "DELETE",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    )
    .then((data) => data.json())
    .then(() => fetchCroissants())
    .catch((e) => console.error(e));
  }

  const handleBlur = () => {
    if (!floor) {
      setFloor(0);
      return;
    }

    if (floor < 0) {
      setFloor(0);
      return;
    }

    if (currentBuilding && floor > currentBuilding?.max_floors) {
      setFloor(currentBuilding.max_floors);
      return;
    }
  }

  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
        <Snowfall 
          color="red"
          style={{
            backgroundImage: `url(${CroissantPNG})`,
            zIndex: 1
          }}
        />
      </div>
      <div className="App">
        <div className="container m-5 p-2 rounded mx-auto bg-light shadow" style={{ zIndex: 100 }}>
          <div className="row m-1 p-4">
              <div className="col">
                  <div className="p-1 h1 text-primary text-center mx-auto display-inline-block">
                    <img
                      className="gif"
                      src={Croissant1}
                      style={{ display: "inline-block", width: 200, height: 200 }}
                    />
                    <u>BRING ME MY CROISSANTS</u>
                    <img
                      className="gif"
                      src={Croissant2}
                      style={{ display: "inline-block", width: 200, height: 200 }}
                    />
                  </div>
              </div>
          </div>
          <div className="row m-1 p-3">
            <div style={{ width: "100%" }}>
                  <div className="form-group">
                    <label htmlFor="amountCroissants">GIVE ME THAT AMOUNT</label>
                    <input onChange={handleInputChanged("AMOUNT")} value={amount || ""} type="number" className="form-control" id="amount" aria-describedby="amountCroissants" placeholder="10000000 (We never have enough croissants)" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="building">BRING THEM THERe</label>
                    <select value={currentBuilding?.id || ""} onChange={handleCurrentBuildingChanged}>
                      {
                        buildings.map((building) => (
                          <option key={building.id} value={building.id}>{building.name}</option>
                        ))
                      }
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="floor">FLOOR N°</label>
                    <input onBlur={handleBlur} onChange={handleInputChanged("FLOOR")} value={floor || ""} type="number" min="0" max={currentBuilding?.max_floors || 0} className="form-control" id="floor" aria-describedby="floor" placeholder="1" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="name">MY NAME IS</label>
                    <input onChange={handleInputChanged("NAME")} value={name || ""} type="string" className="form-control" id="name" aria-describedby="name" placeholder="Croissants L0v3R 59" />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={createRequest}
                  >
                    Submit
                  </button>
              </div>
          </div>
          <div className="p-2 mx-4 border-black-25 border-bottom"></div>
          <div className="row mx-1 px-5 pb-3 w-80">
              <div className="col mx-auto">
                {
                  croissants.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).map((croissant) => (
                    <div key={croissant.id} className="row px-3 align-items-start todo-item rounded">

                        <div className="col px-1 m-1 d-flex align-items-start flex-column mb-4">
                            <h3 className="px-3">Amount: { croissant.amount}</h3>
                            <h3 className="px-3">Building: { croissant.location.building }</h3>
                            <h3 className="px-3">Floor: { croissant.location.floor }</h3>
                            <h3 className="px-3">Name: { croissant.requester }</h3>
                            <h3 className="px-3">Time: { new Date(croissant.time).toLocaleString() }</h3>
                        </div>
                        <div className="col-auto m-1 p-0 px-3 d-none">
                        </div>
                        <div className="col-auto m-1 p-0 todo-actions">
                            <div onClick={handleDeleteCroissant(croissant.id)} className="row d-flex align-items-center justify-content-end">
                                <h5 className="m-0 p-0 px-2">
                                    <i className="fa fa-trash-o text-danger btn m-0 p-0" data-toggle="tooltip" data-placement="bottom" title="Delete todo"></i>
                                </h5>
                            </div>
                        </div>
                    </div>
                  ))
                }
              </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
