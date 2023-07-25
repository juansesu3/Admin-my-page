import { mongooseConnect } from "@/lib/mongoose";
import { Email } from "@/models/Email";

const handle = async (req, res) => {
  const { method } = req;

  await mongooseConnect();

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await Email.findOne({ _id: req.query.id }));
    } else {
      res.json(await Email.find());
    }
  }
  if (method === "DELETE") {
    const { _id } = req.query;
    await Email.deleteOne({ _id });
    res.json("ok");
  }
};
export default handle;
