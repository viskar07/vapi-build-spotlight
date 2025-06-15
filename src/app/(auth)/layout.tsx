import HeroGeometric from "@/components/ReuseableComponents/AuthWrapper";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const AuthLayout = (props: Props) => {
  return (
    <div className="w-full min-h-screen flex justify-center items-center ">
      <HeroGeometric
        title1="Welcome "
        title2="To SpotLight "
      >
      {props.children}
      </HeroGeometric>
    </div>
  );
};

export default AuthLayout;
